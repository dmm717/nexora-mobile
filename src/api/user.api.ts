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

  requestDeletion: async (): Promise<void> => {
    await apiClient.post('/me/deletion-requests');
  },
};
