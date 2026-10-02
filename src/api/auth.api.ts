import { logger } from '@/services/logger';
import { tokenStorage } from '@/services/storage';
import { apiClient } from './client';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
} from './types';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<{ data?: AuthResponse } | AuthResponse>('/auth/mobile/login', payload);
    const result = 'data' in res.data && res.data.data ? res.data.data : (res.data as AuthResponse);
    return result;
  },

  async register(payload: RegisterRequest): Promise<void> {
    await apiClient.post('/auth/register', payload);
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', payload);
  },

  async resendVerification(payload: ResendVerificationRequest): Promise<void> {
    await apiClient.post('/auth/resend-verification', payload);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', payload);
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      await apiClient.post('/auth/mobile/logout', { refreshToken: refreshToken || '' });
    } catch (err: any) {
      // Ignore logout API failures gracefully, but log for visibility
      logger.warn('Logout API failed:', { error: err?.message || err });
    }
  },

  async getMe(): Promise<UserDto> {
    const res = await apiClient.get<{ data?: UserDto } | UserDto>('/me');
    const user = 'data' in res.data && res.data.data ? res.data.data : (res.data as UserDto);
    return user;
  },
};
