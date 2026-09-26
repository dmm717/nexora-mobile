import { BillingSummaryResponse } from './billing.types';

export interface UserDto {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  roles?: string[];
  billing?: BillingSummaryResponse | null;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword?: string;
  resetToken?: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  user?: UserDto;
}
