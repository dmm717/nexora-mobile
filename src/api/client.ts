/* eslint-disable import/no-named-as-default-member */
import { tokenStorage } from '@/services/storage';
import { generateIdempotencyKey } from '../utils/uuid';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse, AppError } from './types';
import { toast } from '@/components/ui/toast/ToastProvider';
import { logger } from '@/services/logger';
import { extractErrorMessage } from '@/utils/errorTranslator';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL as string;

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable. Check your .env setup.');
}

if (!__DEV__ && !API_BASE_URL.startsWith('https://')) {
  throw new Error('SECURITY: API_BASE_URL must use https:// in production.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});


// Idempotency Key generator for mutation operations
export function createIdempotencyKey(): string {
  return generateIdempotencyKey();
}

// Global Auth Error Listener for forcing logout when refresh fails
type AuthErrorListener = () => void;
const authErrorListeners = new Set<AuthErrorListener>();

export function onAuthError(listener: AuthErrorListener) {
  authErrorListeners.add(listener);
  return () => authErrorListeners.delete(listener);
}

function notifyAuthError() {
  authErrorListeners.forEach((listener) => listener());
}

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized 401 Single-Flight Refresh Lock
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

// Response Interceptor: Envelope Unwrapping, Observability & Toast Interception
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Format normalized AppError from Backend Envelope or ASP.NET validation error
    const rawData = error.response?.data;
    const errorEnvelope = (rawData as any)?.error;
    const errorCode = errorEnvelope?.code || 'UNKNOWN_ERROR';
    const requestId = errorEnvelope?.requestId;
    const extractedMessage = extractErrorMessage(rawData, error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');

    const normalizedError = new AppError(errorCode, extractedMessage, requestId, error);

    const isReportProcessing =
      error.response?.status === 409 ||
      errorCode === 'INTERVIEW_REPORT_PROCESSING';

    const isLearningPathNotFound =
      error.response?.status === 404 &&
      errorCode === 'LEARNING_PATH_NOT_FOUND';

    const isRecoverableAuthError = error.response?.status === 401 && originalRequest && !originalRequest._retry;

    const isCareerGoalRequired =
      error.response?.status === 400 &&
      errorCode === 'ACTIVE_CAREER_GOAL_REQUIRED';

    const isFeatureNotAvailable =
      error.response?.status === 403 &&
      errorCode === 'FEATURE_NOT_AVAILABLE';

    // Observability Logging (skip expected transient polling status 409, expected 404s, expected 400/403s, and recoverable 401s)
    if (!isReportProcessing && !isRecoverableAuthError && !isLearningPathNotFound && !isCareerGoalRequired && !isFeatureNotAvailable) {
      // Keep only a shallow error for development diagnostics, never Axios payload graphs.
      const safeError = new Error(error.message);
      safeError.name = error.name;
      safeError.stack = error.stack;

      // Do not attach Axios config/response/request graphs: nested objects retain
      // authorization, bodies and URLs even when top-level fields are filtered.
      const status = error.response?.status;
      const isNetworkError = !error.response || error.code === 'ECONNABORTED';

      if ((status && status >= 400 && status < 500) || isNetworkError) {
        logger.warn(`API Error [${error.config?.method?.toUpperCase() || 'HTTP'}] ${error.config?.url}`, {
          requestId,
          code: errorCode,
          status,
          errorMessage: error.message,
        });
      } else {
        logger.error(`API Error [${error.config?.method?.toUpperCase() || 'HTTP'}] ${error.config?.url}`, safeError, {
          requestId,
          code: errorCode,
          status,
        });
      }
    }

    const reqIdSuffix = requestId ? ` (ReqID: ${requestId.substring(0, 8)})` : '';

    // Auto-trigger Toast for API failures (displaying ONLY Vietnamese message, NO raw error codes)
    // Skip toast for transient polling status (409 INTERVIEW_REPORT_PROCESSING) and expected empty states (404/400/403)
    if (isReportProcessing || error.response?.status === 404 || isCareerGoalRequired || isFeatureNotAvailable) {
      // Do not trigger toast error for expected polling state or missing initial state
    } else if (!error.response) {
      toast.error(`Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.${reqIdSuffix}`);
    } else if (error.response.status === 401) {
      // Handled via refresh flow below
    } else if (error.response.status === 429) {
      toast.warning(`Hệ thống đang xử lý quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.${reqIdSuffix}`);
    } else if (error.response.status >= 500) {
      toast.error(`Máy chủ gặp sự cố tạm thời. Vui lòng thử lại sau.${reqIdSuffix}`);
    } else if (extractedMessage) {
      toast.error(`${extractedMessage}${reqIdSuffix}`);
    }

    // Xử lý 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry &&
        originalRequest.headers?.['X-No-Auth-Retry'] !== 'true') {
      const requestUrl = originalRequest.url || '';

      // Không refresh nếu chính API login hoặc refresh bị 401
      if (requestUrl.includes('/login') || requestUrl.includes('/refresh')) {
        toast.error(extractedMessage);
        return Promise.reject(normalizedError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = await tokenStorage.getRefreshToken();
        const payload = rt ? { refreshToken: rt } : {};
        // Call backend /auth/mobile/refresh with credentials in body
        const refreshResponse = await axios.post<{
          data?: { accessToken: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        }>(
          `${API_BASE_URL}/auth/mobile/refresh`,
          payload,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Failed to obtain new access token');
        }

        await tokenStorage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await tokenStorage.setRefreshToken(newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await tokenStorage.clearTokens();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        notifyAuthError();
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizedError);
  }
);

