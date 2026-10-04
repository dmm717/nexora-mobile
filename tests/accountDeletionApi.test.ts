import { apiClient } from '@/api/client';
import { userApi } from '@/api/user.api';

jest.mock('@/api/client', () => ({
  apiClient: { post: jest.fn(), get: jest.fn() },
  createIdempotencyKey: jest.fn(() => 'generated-key'),
}));

const request = { id: 'request-1', status: 'queued', requestedAt: '2026-10-04T01:00:00Z', completedAt: null, attempts: 0 };

beforeEach(() => jest.clearAllMocks());

it('uses the authenticated me endpoint with a stable key and disables auth replay', async () => {
  (apiClient.post as jest.Mock).mockResolvedValue({ data: { data: request } });
  expect(await userApi.deleteAccount('stable-key')).toEqual(request);
  expect(apiClient.post).toHaveBeenCalledWith('/me/deletion-requests', null, {
    headers: { 'Idempotency-Key': 'stable-key', 'X-No-Auth-Retry': 'true' },
  });
});

it('unwraps null current request rather than treating the envelope as pending', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: { data: null } });
  expect(await userApi.getDeletionRequest()).toBeNull();
  expect(apiClient.get).toHaveBeenCalledWith('/me/deletion-requests/current');
});

it('supports raw server contracts without inventing fields', async () => {
  (apiClient.post as jest.Mock).mockResolvedValue({ data: request });
  expect(await userApi.deleteAccount()).toEqual(request);
  expect(await userApi.deleteAccount()).not.toHaveProperty('scheduledHardDeleteAt');
});

it.each([null, {}, { data: null }, { data: { scheduledHardDeleteAt: '2026-11-04' } }])(
  'rejects unverifiable acceptance %p', async (body) => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: body });
    await expect(userApi.deleteAccount()).rejects.toThrow();
  },
);

it('propagates network failures with no retry', async () => {
  (apiClient.post as jest.Mock).mockRejectedValue(new Error('network'));
  await expect(userApi.deleteAccount()).rejects.toThrow('network');
  expect(apiClient.post).toHaveBeenCalledTimes(1);
});
