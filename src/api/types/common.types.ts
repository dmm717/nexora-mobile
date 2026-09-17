export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export class AppError extends Error {
  code: string;
  requestId?: string;
  originalError?: unknown;

  constructor(code: string, message: string, requestId?: string, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.requestId = requestId;
    this.originalError = originalError;
  }
}
