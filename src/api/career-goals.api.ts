import { apiClient } from './client';
import { CareerGoalResponse, CreateCareerGoalRequest, UpdateCareerGoalRequest } from './types';
import uuid from 'react-native-uuid';

export const careerGoalsApi = {
  create: async (request: CreateCareerGoalRequest): Promise<CareerGoalResponse> => {
    const res = await apiClient.post<{ data?: CareerGoalResponse } | CareerGoalResponse>('/career-goals', request, {
      headers: {
        'Idempotency-Key': uuid.v4().toString(),
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CareerGoalResponse);
  },

  list: async (): Promise<CareerGoalResponse[]> => {
    const res = await apiClient.get<{ data?: CareerGoalResponse[] } | CareerGoalResponse[]>('/career-goals');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CareerGoalResponse[]);
  },

  get: async (id: string): Promise<CareerGoalResponse> => {
    const res = await apiClient.get<{ data?: CareerGoalResponse } | CareerGoalResponse>(`/career-goals/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CareerGoalResponse);
  },

  update: async (id: string, request: UpdateCareerGoalRequest): Promise<CareerGoalResponse> => {
    const res = await apiClient.patch<{ data?: CareerGoalResponse } | CareerGoalResponse>(`/career-goals/${id}`, request);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as CareerGoalResponse);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/career-goals/${id}`, {
      headers: {
        'Idempotency-Key': uuid.v4().toString(),
      },
    });
  },
};
