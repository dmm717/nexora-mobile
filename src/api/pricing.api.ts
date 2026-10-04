import { apiClient } from './client';
import { PlanResponseV2 } from './types';

export const pricingApi = {
  listPlans: async (): Promise<PlanResponseV2[]> => {
    const res = await apiClient.get<{ data?: PlanResponseV2[] } | PlanResponseV2[]>('/plans');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PlanResponseV2[]);
  },
};
