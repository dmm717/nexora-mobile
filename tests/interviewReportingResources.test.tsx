import React from 'react';
import { TextInput, TouchableOpacity, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider, QueryObserverOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { interviewApi } from '@/api/interview.api';
import { AnswerResult, AnswerView, InterviewView, ReportView } from '@/api/types/interview.types';
import { useInterviewSession } from '@/components/interview/useInterviewSession';
import { QuickCoachingModal } from '@/components/interview/QuickCoachingModal';
import { QuestionReviewCard } from '@/components/interview/report/QuestionReviewCard';
import { Colors } from '@/constants/theme';
import { toast } from '@/components/ui/toast/ToastProvider';

jest.mock('@/api/client', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));
jest.mock('@/hooks/useInterviewAudio', () => ({ useInterviewAudio: () => ({
  speakTts: jest.fn(), stopTts: jest.fn(), toggleSpeech: jest.fn(),
  isRecording: false, isMicAllowed: true,
}) }));
jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: (props: React.ComponentProps<typeof Text>) => <Text {...props} /> };
});
jest.mock('@/hooks/use-theme', () => ({ useTheme: () => require('@/constants/theme').Colors.light }));

const sessionId = '11111111-1111-1111-1111-111111111111';
const questionId = '22222222-2222-2222-2222-222222222222';
const answerId = '33333333-3333-3333-3333-333333333333';
const reportId = '44444444-4444-4444-4444-444444444444';
const receipt = { reportId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', receivedAt: '2026-10-05T00:00:00Z' };
const evaluation = { scores: [{ criterion: 'clarity', score: 70, weight: 1 }], feedback: 'Nêu rõ hành động của bạn.', strengths: [], improvements: [] };
const answer: AnswerView = { id: answerId, questionId, content: 'Tôi đã giải quyết sự cố.', createdAt: receipt.receivedAt, evaluationState: 'ready', evaluation };
const session: InterviewView = {
  id: sessionId, status: 'active', role: 'Backend', seniority: 'junior', interviewType: 'behavioral', difficulty: 'normal', version: 1,
  questions: [{ id: questionId, sequence: 1, kind: 'main', topic: 'ownership', content: 'Kể về một sự cố.', createdAt: receipt.receivedAt }],
  answers: [], createdAt: receipt.receivedAt, updatedAt: receipt.receivedAt,
};
const result: AnswerResult = { answer, isComplete: false };
const report: ReportView = {
  id: reportId, interviewId: sessionId, overallScore: 70, rubric: [], strengths: [], gaps: [], actionPlan: [], disclaimer: 'Coaching only', createdAt: receipt.receivedAt,
  questionReviews: [{ questionId, sequence: 1, kind: 'main', topic: 'ownership', question: 'Kể về một sự cố.', answer: answer.content, feedback: evaluation.feedback, rubric: [], strengths: [], improvements: [] }],
};
const post = jest.mocked(apiClient.post);
const get = jest.mocked(apiClient.get);
let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
  get.mockResolvedValue({ data: { data: session } });
  post.mockImplementation(async url => url === '/content-reports'
    ? { status: 202, data: { data: receipt } }
    : { status: 202, data: { data: result } });
});
afterEach(async () => { await act(async () => client.clear()); });

function SessionHarness() {
  const state = useInterviewSession(sessionId);
  return <>
    <Text>{state.isLoading ? 'loading' : 'loaded'}</Text>
    <Text>{state.submitAnswerMutation.status}</Text>
    <TextInput accessibilityLabel="Answer" value={state.answerText} onChangeText={state.setAnswerText} />
    <TouchableOpacity accessibilityLabel="Submit answer" onPress={() => state.submitAnswerMutation.mutate()}><Text>Submit</Text></TouchableOpacity>
    <QuickCoachingModal visible={state.showCoachingModal} coaching={state.lastCoaching} questionSequence={1}
      onContinue={state.handleContinueAfterCoaching} onClose={() => state.setShowCoachingModal(false)} colors={Colors.light} />
  </>;
}
function ReportHarness() {
  const { data } = useQuery({ queryKey: ['report', sessionId], queryFn: () => interviewApi.getReport(sessionId) });
  return data ? <QuestionReviewCard reportId={data.id} review={data.questionReviews![0]} colors={Colors.light} onPracticeAgain={jest.fn()} /> : null;
}
async function submitAnswer() {
  const view = await render(<QueryClientProvider client={client}><SessionHarness /></QueryClientProvider>);
  await waitFor(() => expect(get).toHaveBeenCalledWith(`/interviews/${sessionId}`));
  await waitFor(() => expect(view.getByText('loaded')).toBeTruthy());
  await fireEvent.changeText(view.getByLabelText('Answer'), answer.content);
  await fireEvent.press(view.getByLabelText('Submit answer'));
  await waitFor(() => expect(post).toHaveBeenCalledWith(`/interviews/${sessionId}/answers`, expect.any(Object), expect.any(Object)));
  await waitFor(() => expect(view.getByText('success')).toBeTruthy());
  return view;
}
async function openReport(view: Awaited<ReturnType<typeof render>>) {
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Lý do khác' }));
}

it('carries persisted answer.id through submission state and the real coaching modal, not evaluation.id', async () => {
  post.mockResolvedValueOnce({ status: 202, data: { data: { ...result, answer: { ...answer, evaluation: { ...evaluation, id: reportId } } } } });
  const view = await submitAnswer();
  await waitFor(() => expect(view.getByText(evaluation.feedback)).toBeTruthy());
  await openReport(view);
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(post).toHaveBeenLastCalledWith('/content-reports', {
    contentType: 'interview_answer_evaluation', contentId: answerId, reasonCode: 'other', description: undefined,
  });
  expect(JSON.stringify(post.mock.calls)).not.toContain('contentSnapshot');
  expect(toast.success).toHaveBeenCalledTimes(1);
});

it('does not fall back to evaluation/question/session identity when answer.id is absent', async () => {
  post.mockResolvedValueOnce({ status: 202, data: { data: { ...result, answer: { ...answer, id: undefined, evaluation: { ...evaluation, id: reportId } } } } });
  const view = await submitAnswer();
  await waitFor(() => expect(view.getByText(evaluation.feedback)).toBeTruthy());
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  expect(view.getByText('Tải lại nội dung để báo cáo.')).toBeTruthy();
  expect(post).toHaveBeenCalledTimes(1); // Only the answer submission.
});

it.each(['queued', 'processing', 'failed'] as const)('does not expose inline %s evaluation as reportable', async evaluationState => {
  post.mockResolvedValueOnce({ status: 202, data: { data: { ...result, answer: { ...answer, evaluationState } } } });
  const view = await submitAnswer();
  expect(view.queryByRole('button', { name: 'Báo cáo nội dung AI' })).toBeNull();
  expect(post).toHaveBeenCalledTimes(1);
});

it('hydrates only the matching answer after readiness and respects ready-but-withheld evaluation', async () => {
  post.mockResolvedValueOnce({ status: 202, data: { data: { ...result, answer: { ...answer, evaluationState: 'queued', evaluation: null } } } });
  const view = await submitAnswer();
  await act(async () => client.setQueryData(['interview', sessionId], { ...session, answers: [{ ...answer, id: reportId }] }));
  expect(view.queryByText(evaluation.feedback)).toBeNull();
  await act(async () => client.setQueryData(['interview', sessionId], { ...session, answers: [{ ...answer, evaluation: null }] }));
  expect(view.queryByRole('button', { name: 'Báo cáo nội dung AI' })).toBeNull();
  await act(async () => client.setQueryData(['interview', sessionId], { ...session, answers: [answer] }));
  await waitFor(() => expect(view.getByText(evaluation.feedback)).toBeTruthy());
  await openReport(view);
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(post).toHaveBeenLastCalledWith('/content-reports', expect.objectContaining({ contentType: 'interview_answer_evaluation', contentId: answerId }));
});

it('does not show coaching for an inline ready answer whose evaluation is withheld', async () => {
  post.mockResolvedValueOnce({ status: 202, data: { data: { ...result, answer: { ...answer, evaluation: null } } } });
  const view = await submitAnswer();
  expect(view.queryByRole('button', { name: 'Báo cáo nội dung AI' })).toBeNull();
});

it.each(['queued', 'processing', 'ready', 'failed'] as const)('polls evaluation only while %s is non-terminal', async evaluationState => {
  get.mockResolvedValue({ data: { data: { ...session, answers: [{ ...answer, evaluationState, evaluation: null }] } } });
  const view = await render(<QueryClientProvider client={client}><SessionHarness /></QueryClientProvider>);
  await waitFor(() => expect(view.getByText('loaded')).toBeTruthy());
  const query = client.getQueryCache().find({ queryKey: ['interview', sessionId] })!;
  const interval = (query.options as QueryObserverOptions).refetchInterval;
  expect(typeof interval).toBe('function');
  if (typeof interval === 'function') {
    expect(interval(query)).toBe(evaluationState === 'queued' || evaluationState === 'processing' ? 3000 : false);
  }
});

it('guards duplicate coaching report submits and waits for the 202 receipt', async () => {
  const view = await submitAnswer();
  await waitFor(() => expect(view.getByText(evaluation.feedback)).toBeTruthy());
  await openReport(view);
  let resolveRequest!: (value: unknown) => void;
  post.mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve; }));
  const first = fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  const second = fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(toast.success).not.toHaveBeenCalled();
  await act(async () => resolveRequest({ status: 202, data: { data: receipt } }));
  await Promise.all([first, second]);
  expect(post).toHaveBeenCalledTimes(2);
  expect(toast.success).toHaveBeenCalledTimes(1);
});

it('uses report.id from the actual report API shape and clearly labels overall-report scope', async () => {
  get.mockResolvedValue({ data: { data: report } });
  const view = await render(<QueryClientProvider client={client}><ReportHarness /></QueryClientProvider>);
  await waitFor(() => expect(view.getByText('Phạm vi: toàn bộ báo cáo phỏng vấn')).toBeTruthy());
  expect(get).toHaveBeenCalledWith(`/interviews/${sessionId}/report`);
  await openReport(view);
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(post).toHaveBeenCalledWith('/content-reports', {
    contentType: 'interview_report', contentId: reportId, reasonCode: 'other', description: undefined,
  });
});

it('disables question-review reporting when report.id is missing, despite valid questionId/interviewId', async () => {
  get.mockResolvedValue({ data: { data: { ...report, id: undefined } } });
  const view = await render(<QueryClientProvider client={client}><ReportHarness /></QueryClientProvider>);
  await waitFor(() => expect(view.getByText('Phạm vi: toàn bộ báo cáo phỏng vấn')).toBeTruthy());
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  expect(view.getByText('Tải lại nội dung để báo cáo.')).toBeTruthy();
  expect(post).not.toHaveBeenCalled();
});
