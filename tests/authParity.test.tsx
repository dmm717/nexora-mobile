import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { validatePassword, validateEmail } from '../src/utils/validation';
import LoginScreen from '../src/app/(auth)/login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/auth-context';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ skipSplash: 'true' }),
}));

jest.mock('../src/api/auth.api', () => ({
  authApi: {
    getMe: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Test User' }),
    login: jest.fn().mockResolvedValue({ data: { token: 'mock-token' } }),
    register: jest.fn().mockResolvedValue({ data: { token: 'mock-token' } })
  }
}));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Auth Parity & Validation Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('validatePassword', () => {
    it('returns error for short password', () => {
      expect(validatePassword('abc')).toBe('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('returns error for missing uppercase', () => {
      expect(validatePassword('abcdef1!')).toBe('Mật khẩu phải chứa ít nhất một chữ viết hoa');
    });

    it('returns null for valid password', () => {
      expect(validatePassword('Abcdef1!')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('returns error for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe('Vui lòng nhập định dạng email hợp lệ');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });
  });

// Mock keyboard aware scroll view
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: ({ children }: any) => <>{children}</>
}));

// Icons are mocked globally in jest.setup.js

// Mock UI components to isolate the test to auth logic
jest.mock('@/components/ui/topographic-header', () => ({
  TopographicHeader: () => null
}));
jest.mock('@/components/ui/legal-policy-modal', () => ({
  LegalPolicyModal: () => null
}));
jest.mock('@/components/ui/animated-auth-elements', () => ({
  StaggeredTitle: () => null,
  CenterExpandView: ({ children }: any) => <>{children}</>
}));
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: any) => <>{children}</>
}));
jest.mock('@/components/ui/touchable-scale', () => ({
  TouchableScale: ({ children, onPress, disabled }: any) => {
    const React = require('react');
    const { TouchableOpacity } = require('react-native');
    return <TouchableOpacity onPress={onPress} disabled={disabled}>{children}</TouchableOpacity>;
  }
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => <>{children}</>,
  PanGestureHandler: ({ children }: any) => <>{children}</>,
  ScrollView: ({ children }: any) => <>{children}</>,
  State: { ACTIVE: 4 }
}));

jest.mock('../src/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light'
}));

  describe('LoginScreen UI', () => {
    it('shows error message when submitting weak password in register mode', async () => {
      await renderWithProviders(<LoginScreen />);
      
      // Switch to register mode
      await act(async () => {
        fireEvent.press(screen.getByText('Đăng ký ngay'));
      });
      
      const nameInput = screen.getByPlaceholderText('Nguyễn Văn A');
      const emailInput = screen.getByPlaceholderText('demo@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••••••');
      
      await act(async () => {
        fireEvent.changeText(nameInput, 'Test User');
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'abc');
      });
      
      const submitButton = screen.getByText('Tạo tài khoản');
      
      const alertSpy = jest.spyOn(Alert, 'alert');
      
      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Lỗi',
          expect.stringContaining('8 ký tự')
        );
      });
    });
  });
});
