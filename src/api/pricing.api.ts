import { apiClient } from './client';
import { PlanResponseV2, CheckoutResponse, CheckoutStatusResponse } from './types';
import uuid from 'react-native-uuid';

export const pricingApi = {
  listPlans: async (): Promise<PlanResponseV2[]> => {
    const res = await apiClient.get<{ data?: PlanResponseV2[] } | PlanResponseV2[]>('/plans');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PlanResponseV2[]);
  },

  createCheckoutSession: async (planPriceId: string, idempotencyKey?: string): Promise<CheckoutResponse> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: CheckoutResponse } | CheckoutResponse>(
      '/checkout-sessions',
      { planPriceId },
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutResponse);
  },

  getCheckoutStatus: async (orderId: string): Promise<CheckoutStatusResponse> => {
    const res = await apiClient.get<{ data?: CheckoutStatusResponse } | CheckoutStatusResponse>(
      `/checkout-sessions/${orderId}`
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutStatusResponse);
  },

  refreshCheckoutSession: async (orderId: string): Promise<CheckoutStatusResponse> => {
    const res = await apiClient.post<{ data?: CheckoutStatusResponse } | CheckoutStatusResponse>(
      `/checkout-sessions/${orderId}/refresh`,
      {}
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutStatusResponse);
  },
};
