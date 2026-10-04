import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { apiClient } from '@/api/client';
import { isReportableContentId, reportApi, reportContentTypes } from '@/api/report.api';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';
import { toast } from '@/components/ui/toast/ToastProvider';

jest.mock('@/api/client', () => ({ apiClient: { post: jest.fn() } }));
jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: (props: React.ComponentProps<typeof Text>) => <Text {...props} /> };
});
jest.mock('@/hooks/use-theme', () => ({ useTheme: () => ({
  text: '#000', textMuted: '#555', textSecondary: '#555', background: '#fff',
  border: '#ddd', cardBorder: '#ddd', primary: '#123456', primaryLight: '#123456',
  backgroundElement: '#eee',
}) }));

const id = '11111111-2222-3333-4444-555555555555';
const receipt = { reportId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', receivedAt: '2026-10-04T00:00:00Z' };
const post = jest.mocked(apiClient.post);
beforeEach(() => {
  jest.clearAllMocks();
  post.mockResolvedValue({ status: 202, data: { data: receipt } });
});

it.each(Object.entries(reportContentTypes))('submits canonical type for %s without a client snapshot', async (_label, type) => {
  const result = await reportApi.submitReport({ contentType: type, contentId: id, reasonCode: 'inaccurate' });
  expect(result).toEqual(receipt);
  expect(post).toHaveBeenCalledWith('/content-reports', {
    contentType: type, contentId: id, reasonCode: 'inaccurate', description: undefined,
  });
  expect(JSON.stringify(post.mock.calls)).not.toContain('contentSnapshot');
});

it.each([undefined, null, '', 'skill-profile', 'learning-path', 'unknown', '00000000-0000-0000-0000-000000000000'])(
  'disables reporting for missing or fabricated identity %s', async value => {
    expect(isReportableContentId(value)).toBe(false);
    const view = await render(<ReportContentButton contentType="skill_profile" contentId={value} />);
    await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
    expect(view.getByText('Tải lại nội dung để báo cáo.')).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  },
);

it.each([null, {}, { data: null }, { data: { reportId: id } }, { data: { reportId: 'bad', receivedAt: receipt.receivedAt } }])(
  'does not accept a missing/malformed server receipt', async data => {
    post.mockResolvedValue({ status: 202, data });
    await expect(reportApi.submitReport({ contentType: 'learning_path', contentId: id, reasonCode: 'other' }))
      .rejects.toThrow('chưa xác nhận');
  },
);

it.each(['learning_path', 'skill_profile'] as const)('shows success only after a confirmed %s receipt and prevents duplicate in-flight sends', async type => {
  let resolveRequest!: (value: unknown) => void;
  post.mockImplementation(() => new Promise(resolve => { resolveRequest = resolve; }));
  const view = await render(<ReportContentButton contentType={type} contentId={id} />);
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Lý do khác' }));
  const firstPress = fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  const secondPress = fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(post).toHaveBeenCalledTimes(1);
  expect(toast.success).not.toHaveBeenCalled();
  await act(async () => resolveRequest({ status: 202, data: { data: receipt } }));
  await Promise.all([firstPress, secondPress]);
  await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
});

it.each([401, 404, 409, 429, 503])('shows no success for HTTP %s and permits a deliberate retry', async status => {
  post.mockRejectedValueOnce(Object.assign(new Error('Không thể gửi báo cáo.'), { response: { status } }));
  const view = await render(<ReportContentButton contentType="learning_path" contentId={id} />);
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Lý do khác' }));
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(toast.success).not.toHaveBeenCalled();
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
});

it('does not submit without a reason', async () => {
  const view = await render(<ReportContentButton contentType="learning_path" contentId={id} />);
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  expect(post).not.toHaveBeenCalled();
});

it('cancels without submitting', async () => {
  const view = await render(<ReportContentButton contentType="learning_path" contentId={id} />);
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByLabelText('Đóng báo cáo'));
  expect(post).not.toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
});

it.each(['network', 'malformed receipt'])('never shows success for %s', async failure => {
  if (failure === 'network') post.mockRejectedValue(new Error('Không thể kết nối.'));
  else post.mockResolvedValue({ status: 202, data: { data: null } });
  const view = await render(<ReportContentButton contentType="skill_profile" contentId={id} />);
  await fireEvent.press(view.getByRole('button', { name: 'Báo cáo nội dung AI' }));
  await fireEvent.press(view.getByRole('radio', { name: 'Lý do khác' }));
  await fireEvent.press(view.getByLabelText('Gửi báo cáo'));
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(toast.success).not.toHaveBeenCalled();
  expect(post).toHaveBeenCalledTimes(1);
});
