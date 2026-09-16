import { apiClient } from './client';
import { CareerProfileResponse, PrimaryResumeResponse, SetPrimaryResumeRequest } from './types';

export const profileApi = {
  /**
   * Lấy thông tin hồ sơ nghề nghiệp của user
   */
  getCareerProfile: async (): Promise<CareerProfileResponse> => {
    const res = await apiClient.get<{ data?: CareerProfileResponse } | CareerProfileResponse>('/me/career-profile');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CareerProfileResponse);
  },

  /**
   * Đặt Resume làm Primary CV
   */
  setPrimaryResume: async (request: SetPrimaryResumeRequest): Promise<PrimaryResumeResponse | null> => {
    const res = await apiClient.put<{ data?: PrimaryResumeResponse } | PrimaryResumeResponse>('/me/primary-resume', request);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PrimaryResumeResponse | null);
  },
};
