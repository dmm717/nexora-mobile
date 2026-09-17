import { apiClient } from './client';
import { JobDescriptionView, CreateJobDescriptionRequest } from './types';
import uuid from 'react-native-uuid';

export const jobDescriptionsApi = {
  list: async (): Promise<JobDescriptionView[]> => {
    const res = await apiClient.get<{ data?: JobDescriptionView[] } | JobDescriptionView[]>('/job-descriptions');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as JobDescriptionView[]);
  },

  get: async (id: string): Promise<JobDescriptionView> => {
    const res = await apiClient.get<{ data?: JobDescriptionView } | JobDescriptionView>(`/job-descriptions/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as JobDescriptionView);
  },

  create: async (data: CreateJobDescriptionRequest, idempotencyKey?: string): Promise<JobDescriptionView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: JobDescriptionView } | JobDescriptionView>('/job-descriptions', data, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as JobDescriptionView);
  },
};

