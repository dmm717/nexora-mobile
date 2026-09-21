import { apiClient } from './client';
import {
  ScenarioCategoryResponse,
  ScenarioPageResponse,
  ScenarioDetailResponse,
  ScenarioAttemptResponse,
  ScenarioAttemptHistoryResponse,
  ScenarioProgressResponse,
} from './types';
import uuid from 'react-native-uuid';

export const scenariosApi = {
  listCategories: async (): Promise<ScenarioCategoryResponse[]> => {
    const res = await apiClient.get<{ data?: ScenarioCategoryResponse[] } | ScenarioCategoryResponse[]>('/scenarios/categories');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioCategoryResponse[]);
  },

  list: async (params?: {
    category?: string;
    difficulty?: string;
    competency?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ScenarioPageResponse> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.competency) query.append('competency', params.competency);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

    const url = `/scenarios${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<{ data?: ScenarioPageResponse } | ScenarioPageResponse>(url);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioPageResponse);
  },

  get: async (slugOrId: string): Promise<ScenarioDetailResponse> => {
    const res = await apiClient.get<{ data?: ScenarioDetailResponse } | ScenarioDetailResponse>(`/scenarios/${slugOrId}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioDetailResponse);
  },

  createAttempt: async (scenarioId: string, idempotencyKey?: string): Promise<ScenarioAttemptResponse> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: ScenarioAttemptResponse } | ScenarioAttemptResponse>(
      '/scenario-attempts',
      { scenarioId },
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptResponse);
  },

  submitAttempt: async (attemptId: string, answer: string, idempotencyKey?: string): Promise<ScenarioAttemptResponse> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: ScenarioAttemptResponse } | ScenarioAttemptResponse>(
      `/scenario-attempts/${attemptId}/submit`,
      { answer },
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptResponse);
  },

  getAttempt: async (attemptId: string): Promise<ScenarioAttemptResponse> => {
    const res = await apiClient.get<{ data?: ScenarioAttemptResponse } | ScenarioAttemptResponse>(`/scenario-attempts/${attemptId}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptResponse);
  },

  listAttempts: async (): Promise<ScenarioAttemptResponse[]> => {
    const res = await apiClient.get<{ data?: ScenarioAttemptResponse[] } | ScenarioAttemptResponse[]>('/scenario-attempts');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptResponse[]);
  },

  getHistory: async (slugOrId: string): Promise<ScenarioAttemptHistoryResponse> => {
    const res = await apiClient.get<{ data?: ScenarioAttemptHistoryResponse } | ScenarioAttemptHistoryResponse>(`/scenarios/${slugOrId}/attempts`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptHistoryResponse);
  },

  retry: async (scenarioId: string, idempotencyKey?: string): Promise<ScenarioAttemptResponse> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: ScenarioAttemptResponse } | ScenarioAttemptResponse>(
      `/scenarios/${scenarioId}/retry`,
      {},
      { headers: { 'Idempotency-Key': key } }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioAttemptResponse);
  },

  getProgress: async (): Promise<ScenarioProgressResponse> => {
    const res = await apiClient.get<{ data?: ScenarioProgressResponse } | ScenarioProgressResponse>('/scenarios/progress');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ScenarioProgressResponse);
  },
};
