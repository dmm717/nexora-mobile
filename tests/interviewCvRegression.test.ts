import { apiClient } from '@/api/client';
import { interviewApi } from '@/api/interview.api';
import { resumesApi } from '@/api/resumes.api';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';

jest.mock('@/api/client', () => ({
  API_BASE_URL: 'https://api.test/api/v1',
  apiClient: { post: jest.fn(), get: jest.fn() },
}));
jest.mock('@/services/storage', () => ({ tokenStorage: { getAccessToken: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

it('preserves answer submission and completing/report retrieval without a purchase dependency', async () => {
  const answer = { questionId: 'q1', content: 'Mock interview answer', durationSeconds: 15 };
  const result = { answer: { content: answer.content }, continuation: { state: 'in_progress' } };
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { data: result } });
  expect(await interviewApi.submitAnswer('i1', answer, 'answer-key')).toEqual(result);
  expect(apiClient.post).toHaveBeenCalledWith('/interviews/i1/answers', answer, { headers: { 'Idempotency-Key': 'answer-key' } });
  const completed = { id: 'i1', status: 'completed' };
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { data: completed } });
  expect(await interviewApi.completeInterview('i1', 'complete-key')).toEqual(completed);
  expect(apiClient.post).toHaveBeenLastCalledWith('/interviews/i1/complete', {}, { headers: { 'Idempotency-Key': 'complete-key' } });
  const report = { id: 'report-1', overallScore: 72 };
  (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { data: report } });
  expect(await interviewApi.getReport('i1')).toEqual(report);
});

it('preserves CV upload-intent, finalize and analysis contracts', async () => {
  const upload = { fileName: 'mock-cv.pdf', contentType: 'application/pdf', size: 1024 };
  const intent = { id: 'intent-1', uploadUrl: 'https://storage.test/mock' };
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { data: intent } });
  expect(await resumesApi.presign(upload)).toEqual(intent);
  expect(apiClient.post).toHaveBeenLastCalledWith('/uploads/presign', upload);
  const finalize = { uploadIntentId: 'intent-1', uploadToken: 'mock-upload-token' };
  const resume = { id: 'cv1', status: 'ready' };
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { data: resume } });
  expect(await resumesApi.finalize(finalize)).toEqual(resume);
  expect(apiClient.post).toHaveBeenLastCalledWith('/resumes', finalize);
  const analysisInput = { resumeId: 'cv1', jobDescriptionId: 'jd1', mode: 'cv_jd' as const };
  const analysis = { id: 'analysis-1', status: 'queued' };
  (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { data: analysis } });
  expect(await resumeAnalysesApi.create(analysisInput)).toEqual(analysis);
  expect(apiClient.post).toHaveBeenLastCalledWith('/resume-analyses', analysisInput, { headers: { 'Idempotency-Key': expect.any(String) } });
});
