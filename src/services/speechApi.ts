import { apiClient } from '@/api/client';

export interface SpeechAuthorization {
  token: string;
  region: string;
  expiresAt: string;
}

export interface SpeechAuthorizationEnvelope {
  data: SpeechAuthorization;
}

/** Fetch a short-lived Azure Speech authorization using the authenticated API client. */
export const fetchInterviewSpeechAuthorization = async (
  interviewId: string
): Promise<SpeechAuthorization> => {
  const res = await apiClient.post<{ data?: SpeechAuthorization } | SpeechAuthorization>(
    `/speech/interviews/${encodeURIComponent(interviewId)}/token`
  );

  return 'data' in res.data && res.data.data ? res.data.data : (res.data as SpeechAuthorization);
};
