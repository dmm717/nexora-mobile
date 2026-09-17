import { apiClient } from './client';
import { StarAttemptCreateRequest, StarAttemptResponse } from './types';
import uuid from 'react-native-uuid';

export const starApi = {
  create: async (request: StarAttemptCreateRequest, idempotencyKey?: string): Promise<StarAttemptResponse> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: StarAttemptResponse } | StarAttemptResponse>(
      '/star-attempts',
      request,
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as StarAttemptResponse);
  },

  get: async (id: string): Promise<StarAttemptResponse> => {
    const res = await apiClient.get<{ data?: StarAttemptResponse } | StarAttemptResponse>(`/star-attempts/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as StarAttemptResponse);
  },

  list: async (): Promise<StarAttemptResponse[]> => {
    const res = await apiClient.get<{ data?: StarAttemptResponse[] } | StarAttemptResponse[]>('/star-attempts');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as StarAttemptResponse[]);
  },
};
