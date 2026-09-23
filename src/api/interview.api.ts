import { apiClient } from './client';
import {
  StartInterviewRequest,
  SubmitAnswerRequest,
  PracticeAgainRequest,
  InterviewView,
  AnswerResult,
  ReportView,
  InterviewHistoryResponse,
} from './types';
import uuid from 'react-native-uuid';

export const interviewApi = {
  start: async (request: StartInterviewRequest, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>('/interviews', request, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  get: async (id: string): Promise<InterviewView> => {
    const res = await apiClient.get<{ data?: InterviewView } | InterviewView>(`/interviews/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  list: async (page = 1, pageSize = 20, status?: string): Promise<InterviewHistoryResponse> => {
    let url = `/interviews?page=${page}&pageSize=${pageSize}`;
    if (status && status !== 'all') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const res = await apiClient.get<{ data?: InterviewHistoryResponse } | InterviewHistoryResponse>(url);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewHistoryResponse);
  },

  submitAnswer: async (id: string, request: SubmitAnswerRequest, idempotencyKey?: string): Promise<AnswerResult> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: AnswerResult } | AnswerResult>(`/interviews/${id}/answers`, request, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as AnswerResult);
  },

  continueInterview: async (id: string, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/continue`, {}, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  completeInterview: async (id: string, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/complete`, {}, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  getReport: async (id: string): Promise<ReportView> => {
    const res = await apiClient.get<{ data?: ReportView } | ReportView>(`/interviews/${id}/report`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ReportView);
  },

  retryReport: async (id: string, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/report/retry`, {}, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  practiceAgain: async (id: string, request: PracticeAgainRequest, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/practice-again`, request, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  retryQuestionPreparation: async (id: string, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/questions/retry`, {}, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },

  retryResults: async (id: string, idempotencyKey?: string): Promise<InterviewView> => {
    const key = idempotencyKey || uuid.v4().toString();
    const res = await apiClient.post<{ data?: InterviewView } | InterviewView>(`/interviews/${id}/results/retry`, {}, {
      headers: {
        'Idempotency-Key': key,
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as InterviewView);
  },
};
