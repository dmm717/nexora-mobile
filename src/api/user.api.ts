import { apiClient } from './client';
import { UserDto } from './types/auth.types';

export interface UpdateProfileRequest {
  displayName?: string | null;
  yearsOfExperience?: number | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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

  deleteAccount: async (): Promise<any> => {
    const res = await apiClient.post('/me/deletion-requests');
    return res.data;
  },

  getDeletionRequest: async (): Promise<any> => {
    const res = await apiClient.get('/me/deletion-requests/current');
    return 'data' in res.data && res.data.data ? res.data.data : res.data;
  },

  cancelDeletionRequest: async (): Promise<void> => {
    await apiClient.delete('/me/deletion-requests/current');
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
