import { apiClient } from './client';
import { PlanResponseV2, CheckoutResponse, CheckoutStatusResponse } from './types';
import { generateIdempotencyKey } from '../utils/uuid';

export const pricingApi = {
  listPlans: async (): Promise<PlanResponseV2[]> => {
    const res = await apiClient.get<{ data?: PlanResponseV2[] } | PlanResponseV2[]>('/plans');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PlanResponseV2[]);
  },

  /**
   * @deprecated web only, KHÔNG dùng trên native
   */
  createCheckoutSession: async (planPriceId: string, idempotencyKey?: string): Promise<CheckoutResponse> => {
    const key = idempotencyKey || generateIdempotencyKey();
    const res = await apiClient.post<{ data?: CheckoutResponse } | CheckoutResponse>(
      '/checkout-sessions',
      { planPriceId },
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutResponse);
  },

  /**
   * @deprecated web only, KHÔNG dùng trên native
   */
  getCheckoutStatus: async (orderId: string): Promise<CheckoutStatusResponse> => {
    const res = await apiClient.get<{ data?: CheckoutStatusResponse } | CheckoutStatusResponse>(
      `/checkout-sessions/${orderId}`
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutStatusResponse);
  },

  /**
   * @deprecated web only, KHÔNG dùng trên native
   */
  refreshCheckoutSession: async (orderId: string): Promise<CheckoutStatusResponse> => {
    const res = await apiClient.post<{ data?: CheckoutStatusResponse } | CheckoutStatusResponse>(
      `/checkout-sessions/${orderId}/refresh`,
      {}
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CheckoutStatusResponse);
  },

  verifyGooglePlayPurchase: async (productId: string, purchaseToken: string, orderId?: string): Promise<any> => {
    const res = await apiClient.post(
      '/billing/google-play/verify',
      { productId, purchaseToken, orderId }
    );
    return 'data' in res.data && res.data.data ? res.data.data : res.data;
  },
};
