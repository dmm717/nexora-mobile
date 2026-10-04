import { apiClient, createIdempotencyKey } from './client';
import { UserDto } from './types/auth.types';

export interface UpdateProfileRequest {
  displayName?: string | null;
  yearsOfExperience?: number | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** MeController / PrivacyContracts at backend main 8c5b346. No scheduled date. */
export interface DeletionRequest {
  id: string;
  status: string;
  requestedAt: string;
  completedAt: string | null;
  attempts?: number;
}

function unwrapDeletionRequest(body: unknown): DeletionRequest | null {
  const value = body && typeof body === 'object' && 'data' in body ? body.data : body;
  if (value === null) return null;
  if (!value || typeof value !== 'object' || !('id' in value) || typeof value.id !== 'string' ||
      !('status' in value) || typeof value.status !== 'string' ||
      !('requestedAt' in value) || typeof value.requestedAt !== 'string') {
    throw new Error('Không thể xác minh trạng thái yêu cầu xóa. Vui lòng kiểm tra lại trước khi gửi tiếp.');
  }
  return value as DeletionRequest;
}

export const userApi = {
  getCurrentUser: async (): Promise<UserDto> => {
    const res = await apiClient.get<{ data?: UserDto } | UserDto>('/me');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as UserDto);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserDto> => {
    const res = await apiClient.patch<{ data?: UserDto } | UserDto>('/me/profile', data);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as UserDto);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/me/password', data, {
      headers: {
        'X-Skip-Auth-Redirect': 'true',
      },
    });
  },

  exportData: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/me/export');
    return res.data;
  },

  deleteAccount: async (idempotencyKey = createIdempotencyKey()): Promise<DeletionRequest> => {
    const res = await apiClient.post('/me/deletion-requests', null, {
      headers: { 'Idempotency-Key': idempotencyKey, 'X-No-Auth-Retry': 'true' }
    });
    const request = unwrapDeletionRequest(res.data);
    if (!request) throw new Error('Máy chủ chưa xác nhận yêu cầu xóa tài khoản.');
    return request;
  },

  getDeletionRequest: async (): Promise<DeletionRequest | null> => {
    const res = await apiClient.get('/me/deletion-requests/current');
    return unwrapDeletionRequest(res.data);
  },

  uploadAvatar: async (fileUri: string, mimeType: string, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: filename,
    } as any);

    const res = await apiClient.put('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = 'data' in res.data && res.data.data ? res.data.data : res.data;
    return (data as any).avatarUrl;
  },

  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete('/me/avatar');
  },
};
