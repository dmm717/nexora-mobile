import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountDeletionModal } from '@/components/account/AccountDeletionModal';
import { AccountPendingDeletionBanner } from '@/components/account/AccountPendingDeletionBanner';
import { userApi } from '@/api/user.api';
import { toast } from '@/components/ui/toast/ToastProvider';
import { deletionDateText, deletionStatusText, isDeletionConfirmed } from '@/utils/deletion-presentation';

jest.mock('@/api/user.api', () => ({ userApi: { deleteAccount: jest.fn(), getDeletionRequest: jest.fn() } }));
jest.mock('@/api/client', () => ({ createIdempotencyKey: () => 'stable-key' }));
jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: (props: any) => <Text {...props} /> };
});
jest.mock('@/components/ui/touchable-scale', () => {
  const { Pressable } = require('react-native');
  return { TouchableScale: (props: any) => <Pressable {...props} /> };
});

const request = { id: 'r1', status: 'queued', requestedAt: '2026-10-04T01:00:00Z', completedAt: null };
const colors = { background: 'white', cardBorder: 'gray', text: 'black' };
function wrapper({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: 3, gcTime: Infinity } },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
async function openConfirmation(logout = jest.fn().mockResolvedValue(undefined), email = 'test@example.com') {
  const onClose = jest.fn();
  const view = await render(<AccountDeletionModal visible colors={colors} userEmail={email} onClose={onClose} logout={logout} />, { wrapper });
  await fireEvent.press(view.getByText('Tiếp Tục'));
  return { ...view, logout, onClose };
}
beforeEach(() => jest.clearAllMocks());

it('requires two steps and deliberate exact confirmation; blank email cannot confirm', async () => {
  const view = await openConfirmation(undefined, '');
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  await fireEvent.changeText(view.getByPlaceholderText('XÓA'), 'xóa');
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  expect(userApi.deleteAccount).not.toHaveBeenCalled();
  expect(isDeletionConfirmed('', '')).toBe(false);
});

it('blocks duplicate submissions and closing while pending, then clears session on acceptance without a date', async () => {
  let resolve!: (value: typeof request) => void;
  (userApi.deleteAccount as jest.Mock).mockReturnValue(new Promise(r => { resolve = r; }));
  const view = await openConfirmation();
  await fireEvent.changeText(view.getByPlaceholderText('XÓA'), 'XÓA');
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  await fireEvent.press(view.getByText('Quay Lại'));
  await waitFor(() => expect(userApi.deleteAccount).toHaveBeenCalledTimes(1));
  expect(view.logout).not.toHaveBeenCalled();
  resolve(request);
  await waitFor(() => expect(view.logout).toHaveBeenCalledTimes(1));
  expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('đã được ghi nhận'));
  expect(view.queryByText(/Ngày xóa vĩnh viễn/)).toBeNull();
  expect(view.onClose).not.toHaveBeenCalled();
});

it('network failure stays an error with no success/logout/automatic retry and manual retry reuses the key', async () => {
  (userApi.deleteAccount as jest.Mock).mockRejectedValueOnce(new Error('network'));
  const view = await openConfirmation();
  await fireEvent.changeText(view.getByPlaceholderText('XÓA'), 'test@example.com');
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  await waitFor(() => expect(view.getByText(/Chưa nhận được xác nhận/)).toBeTruthy());
  expect(view.logout).not.toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
  expect(userApi.deleteAccount).toHaveBeenCalledTimes(1);
  (userApi.deleteAccount as jest.Mock).mockResolvedValue(request);
  await fireEvent.press(view.getByText('Xác Nhận Xóa'));
  await waitFor(() => expect(view.logout).toHaveBeenCalledTimes(1));
  expect((userApi.deleteAccount as jest.Mock).mock.calls).toEqual([['stable-key'], ['stable-key']]);
});

it('resets confirmation on close/reopen', async () => {
  const props = { colors, userEmail: 'test@example.com', onClose: jest.fn(), logout: jest.fn() };
  const view = await render(<AccountDeletionModal {...props} visible />, { wrapper });
  await fireEvent.press(view.getByText('Tiếp Tục'));
  await fireEvent.changeText(view.getByPlaceholderText('XÓA'), 'XÓA');
  await view.rerender(<AccountDeletionModal {...props} visible={false} />);
  await view.rerender(<AccountDeletionModal {...props} visible />);
  expect(view.getByText('Tiếp Tục')).toBeTruthy();
  await fireEvent.press(view.getByText('Tiếp Tục'));
  expect(view.getByPlaceholderText('XÓA').props.value).toBe('');
});

it.each(['queued', 'processing', 'completed', 'failed', 'unknown'])('renders actual server status %s with no promised completion', async status => {
  (userApi.getDeletionRequest as jest.Mock).mockResolvedValue({ ...request, status });
  const view = await render(<AccountPendingDeletionBanner />, { wrapper });
  await waitFor(() => expect(view.queryByText(/Đang kiểm tra/)).toBeNull());
  expect(view.queryByText(/Dự kiến xóa/)).toBeNull();
  expect(view.getByText(deletionStatusText({ ...request, status }))).toBeTruthy();
});

it('shows server completion time only for completed status', async () => {
  const completedAt = '2026-10-04T02:00:00Z';
  (userApi.getDeletionRequest as jest.Mock).mockResolvedValue({ ...request, status: 'completed', completedAt });
  const view = await render(<AccountPendingDeletionBanner />, { wrapper });
  await waitFor(() => expect(view.getByText(`Đã xử lý lúc: ${deletionDateText(completedAt)}`)).toBeTruthy());
});

it('treats a normalized API 404 as no current request', async () => {
  (userApi.getDeletionRequest as jest.Mock).mockRejectedValue({ originalError: { response: { status: 404 } } });
  const view = await render(<AccountPendingDeletionBanner />, { wrapper });
  await waitFor(() => expect(view.queryByText(/Đang kiểm tra/)).toBeNull());
  expect(await view.toJSON()).toBeNull();
});

it('distinguishes unavailable status from no request', async () => {
  (userApi.getDeletionRequest as jest.Mock).mockRejectedValue(new Error('offline'));
  const view = await render(<AccountPendingDeletionBanner />, { wrapper });
  await waitFor(() => expect(view.getByText(/Không thể kiểm tra trạng thái/)).toBeTruthy());
});

it('does not display a pending request for null', async () => {
  (userApi.getDeletionRequest as jest.Mock).mockResolvedValue(null);
  const view = await render(<AccountPendingDeletionBanner />, { wrapper });
  await waitFor(() => expect(view.queryByText(/Đang kiểm tra/)).toBeNull());
  expect(await view.toJSON()).toBeNull();
  expect(deletionDateText('invalid')).toBeNull();
});
