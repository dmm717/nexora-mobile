import { apiClient } from './client';
import { PlatformStatsResponse } from './types/platform-stats.types';

export const platformStatsApi = {
  getStats: async (): Promise<PlatformStatsResponse> => {
    const res = await apiClient.get<{ data?: PlatformStatsResponse } | PlatformStatsResponse>('/public/platform-stats');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PlatformStatsResponse);
  },
};
