import { useQuery } from '@tanstack/react-query';
import { platformStatsApi } from '@/api/platform-stats.api';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['public', 'platform-stats'],
    queryFn: platformStatsApi.getStats,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
