import { tokenStorage } from '@/services/storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse, AppError } from './types';
import { toast } from '@/components/ui/toast/ToastProvider';
import { logger } from '@/services/logger';
import { extractErrorMessage } from '@/utils/errorTranslator';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://nexora-backend-q32b.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Idempotency Key generator for mutation operations
export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

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

    // Observability Logging
    logger.error(`API Error [${error.config?.method?.toUpperCase() || 'HTTP'}] ${error.config?.url}`, error, {
      requestId,
      code: errorCode,
      status: error.response?.status,
    });

    // Auto-trigger Toast for API failures (displaying ONLY Vietnamese message, NO raw error codes)
    if (!error.response) {
      toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else if (error.response.status === 401) {
      // Handled via refresh flow below
    } else if (error.response.status === 429) {
      toast.warning('Hệ thống đang xử lý quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.');
    } else if (error.response.status >= 500) {
      toast.error('Máy chủ gặp sự cố tạm thời. Vui lòng thử lại sau.');
    } else if (extractedMessage) {
      toast.error(extractedMessage);
    }

    // Xử lý 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';

      // Không refresh nếu chính API login hoặc refresh bị 401
      if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')) {
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
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh
        const refreshResponse = await axios.post<{
          data?: { accessToken: string; refreshToken?: string };
          accessToken?: string;
          refreshToken?: string;
        }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
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
