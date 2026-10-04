/// <reference types="node" />
import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { PrivacyPolicyContent } from '@/components/ui/legal/PrivacyPolicyContent';
import { TermsOfServiceContent } from '@/components/ui/legal/TermsOfServiceContent';
import { PaymentPolicyContent } from '@/components/ui/legal/PaymentPolicyContent';
import { DataDeletionContent } from '@/components/ui/legal/DataDeletionContent';
import { LegalComplianceCard } from '@/components/account/LegalComplianceCard';
import { WEBSITE_URL, PRIVACY_URL, ACCOUNT_DELETION_URL, SUPPORT_EMAIL } from '@/constants/legal';
import { toast } from '@/components/ui/toast/ToastProvider';

jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: (props: any) => <Text {...props} /> };
});
jest.mock('@/components/ui/glass-card', () => {
  const { View } = require('react-native');
  return { GlassCard: (props: any) => <View {...props} /> };
});
jest.mock('@/components/ui/touchable-scale', () => {
  const { Pressable } = require('react-native');
  return { TouchableScale: (props: any) => <Pressable {...props} /> };
});

const props = { colors: { text: 'black', textSecondary: 'gray' }, styles: {} };
it.each([PrivacyPolicyContent, TermsOfServiceContent, PaymentPolicyContent, DataDeletionContent])(
  'renders current policy without false billing claims or obsolete contacts', async Component => {
    const view = await render(<Component {...props} />);
    const content = JSON.stringify(await view.toJSON());
    expect(content).not.toMatch(/Google Play Billing|support@nexora\.(vn|com)|nexorainterview@gmail\.com|https:\/\/nexora\.vn|store\/account\/subscriptions/);
    expect(await view.toJSON()).toBeTruthy();
  },
);
it('keeps all four policies accessible from account settings', async () => {
  const openLegalModal = jest.fn();
  const view = await render(<LegalComplianceCard openLegalModal={openLegalModal} colors={props.colors} />);
  for (const label of ['Chính sách bảo mật', 'Điều khoản dịch vụ', 'Chính sách thanh toán & hoàn tiền', 'Quy trình xóa tài khoản & dữ liệu']) {
    await fireEvent.press(view.getByText(label));
  }
  expect(openLegalModal.mock.calls).toEqual([['privacy'], ['terms'], ['payment'], ['deletion']]);
});
it.each([PrivacyPolicyContent, DataDeletionContent])('opens the verified public deletion URL in the system browser from legal content', async Component => {
  expect(WEBSITE_URL).toBe('https://www.nexorainterview.io.vn');
  expect(PRIVACY_URL).toBe(`${WEBSITE_URL}/privacy`);
  expect(ACCOUNT_DELETION_URL).toBe(`${WEBSITE_URL}/account-deletion`);
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const view = await render(<Component {...props} />);
  const link = view.getByRole('link', { name: 'Mở trang yêu cầu xóa tài khoản Nexora' });
  expect(link.props.accessibilityHint).toContain('không cần đăng nhập');
  await fireEvent.press(link);
  expect(openURL).toHaveBeenCalledWith(ACCOUNT_DELETION_URL);
  expect(JSON.stringify(await view.toJSON())).not.toMatch(/chưa được xác minh|đang được triển khai/);
  expect(JSON.stringify(await view.toJSON())).toContain('30 phút');
  openURL.mockRestore();
});

it('handles browser failure without implying in-app deletion depends on the website', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('browser unavailable'));
  const view = await render(<DataDeletionContent {...props} />);
  await fireEvent.press(view.getByRole('link'));
  expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('vẫn có thể gửi yêu cầu xóa trong Cài đặt tài khoản'));
  openURL.mockRestore();
});

it('publishes only the owner-selected support email', async () => {
  expect(SUPPORT_EMAIL).toBe('nexorainterview.vn@gmail.com');
  const view = await render(<PrivacyPolicyContent {...props} />);
  expect(JSON.stringify(await view.toJSON())).toContain(SUPPORT_EMAIL);
});

it('guards active native source against checkout APIs, purchase SDKs and checkout links', () => {
  const walk = (folder: string): string[] => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(folder, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(tsx?|json)$/.test(full) ? [full] : [];
  });
  const files = [...walk(path.join(__dirname, '../src')), path.join(__dirname, '../package.json')];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    expect(content).not.toMatch(/createCheckoutSession|refreshCheckoutSession|verifyGooglePlayPurchase|\/checkout-sessions|billing\/google-play\/verify|expo-iap|react-native-purchases|store\/account\/subscriptions|https?:\/\/[^\s'"<>]*payos/i);
  }
});
