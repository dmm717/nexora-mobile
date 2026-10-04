import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PricingScreen from '@/app/(app)/pricing';
import { authApi } from '@/api/auth.api';
import { pricingApi } from '@/api/pricing.api';

jest.mock('@/api/auth.api', () => ({ authApi: { getMe: jest.fn() } }));
jest.mock('@/api/pricing.api', () => ({ pricingApi: { listPlans: jest.fn() } }));
jest.mock('@/hooks/use-color-scheme', () => ({ useColorScheme: () => 'light' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: any) => <>{children}</> }));
jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: (props: any) => <Text {...props} /> };
});
jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return { ThemedView: (props: any) => <View {...props} /> };
});
jest.mock('@/components/ui/glass-card', () => {
  const { View } = require('react-native');
  return { GlassCard: (props: any) => <View {...props} /> };
});
jest.mock('@/components/navigation/app-bottom-nav-bar', () => ({ AppBottomNavBar: () => null }));
jest.mock('@/components/navigation/app-screen-header', () => ({ AppScreenHeader: () => null }));

const feature = { code: 'interview', enabled: true, limit: 12, reserved: 0, consumed: 5, adjustment: 0, available: 7, unlimited: false };
const me = { billing: {
  entitlement: { planCode: 'BASIC', endsAt: '2026-12-01T00:00:00Z', features: [feature] },
  orders: [{ id: 'order-1234567890', planCode: 'BASIC', status: 'paid', amountMinor: 123000, currency: 'VND', createdAt: '2026-10-01T00:00:00Z' }],
} };
const plans = ['BASIC', 'PRO'].map(code => ({ id: code, code, name: `SERVER ${code}`, description: 'Buy on web', isHighlighted: true,
  prices: [{ id: 'p1', amountMinor: 999999, currency: 'VND', durationDays: 30, interviewQuota: 12,
    features: [{ ...feature, name: 'Phỏng vấn' }] }],
}));
function wrapper({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => jest.clearAllMocks());

it('renders backend account quotas, consumption, expiry and existing orders without offer prices or upsells', async () => {
  (authApi.getMe as jest.Mock).mockResolvedValue(me);
  (pricingApi.listPlans as jest.Mock).mockResolvedValue(plans);
  const view = await render(<PricingScreen />, { wrapper });
  await waitFor(() => expect(view.getByText('7 phiên')).toBeTruthy());
  expect(view.getByText('Đã dùng: 5')).toBeTruthy();
  expect(view.getByText('SERVER BASIC')).toBeTruthy();
  expect(view.queryByText('SERVER PRO')).toBeNull();
  expect(view.queryByText('Buy on web')).toBeNull();
  expect(view.getByText('Lịch sử giao dịch')).toBeTruthy();
  expect(view.getByText(new Date(me.billing.entitlement.endsAt).toLocaleDateString('vi-VN'))).toBeTruthy();
  expect(view.queryByText(/999[.,]999|Nâng cấp|Phổ biến nhất/)).toBeNull();
});

it('does not manufacture an active plan when account retrieval fails', async () => {
  (authApi.getMe as jest.Mock).mockRejectedValue(new Error('offline'));
  (pricingApi.listPlans as jest.Mock).mockResolvedValue(plans);
  const view = await render(<PricingScreen />, { wrapper });
  await waitFor(() => expect(view.getByText('Không thể tải')).toBeTruthy());
  expect(view.queryByText('Đang hoạt động')).toBeNull();
  expect(view.queryByText('SERVER BASIC')).toBeNull();
});
