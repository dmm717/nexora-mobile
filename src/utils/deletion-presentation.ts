import type { DeletionRequest } from '@/api/user.api';

export const DELETION_ACCEPTED_MESSAGE = 'Yêu cầu xóa tài khoản đã được ghi nhận. Hệ thống sẽ xử lý theo quy trình bảo vệ dữ liệu của Nexora.';

export function deletionStatusText(request: DeletionRequest): string {
  const labels: Record<string, string> = {
    queued: 'Yêu cầu đang chờ xử lý',
    processing: 'Yêu cầu đang được xử lý',
    completed: 'Yêu cầu đã được xử lý',
    failed: 'Yêu cầu xử lý chưa thành công',
  };
  return labels[request.status] ?? 'Đã ghi nhận yêu cầu; chưa xác định trạng thái xử lý';
}

export function deletionDateText(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString('vi-VN');
}

export function isDeletionConfirmed(text: string, email: string): boolean {
  return text === 'XÓA' || (email.length > 0 && text === email);
}
