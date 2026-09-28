import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  View,
  Image,
  StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeOut } from 'react-native-reanimated';
import { validateEmail, validatePassword } from '@/utils/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/api/types';
import { authApi } from '@/api/auth.api';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TopographicHeader } from '@/components/ui/topographic-header';
import { LegalPolicyModal, PolicyTab } from '@/components/ui/legal-policy-modal';
import { styles } from '@/styles/login.styles';

import { AuthStep } from '@/components/auth/types';
import { WelcomeSection } from '@/components/auth/WelcomeSection';
import { SignInSection } from '@/components/auth/SignInSection';
import { SignUpSection } from '@/components/auth/SignUpSection';
import { ForgotRequestSection } from '@/components/auth/ForgotRequestSection';
import { ForgotDoneSection } from '@/components/auth/ForgotDoneSection';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ step?: string; skipSplash?: string; email?: string }>();

  const initialStep: AuthStep = (params.step as AuthStep) || (params.skipSplash === 'true' ? 'signin' : 'welcome');
  const isDirectSignIn = params.skipSplash === 'true' || Boolean(params.step);

  const [step, setStep] = useState<AuthStep>(initialStep);
  const [isSplash, setIsSplash] = useState(!isDirectSignIn);

  // Legal Modal State
  const [isLegalModalVisible, setIsLegalModalVisible] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('terms');

  const openLegalModal = (tab: PolicyTab) => {
    setLegalModalTab(tab);
    setIsLegalModalVisible(true);
  };

  const closeLegalModal = useCallback(() => {
    setIsLegalModalVisible(false);
  }, []);

  // Form Fields State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isDirectSignIn) {
      setIsSplash(false);
      SplashScreen.hideAsync();
      return;
    }
    const timer = setTimeout(() => {
      setIsSplash(false);
      SplashScreen.hideAsync();
    }, 800);
    return () => clearTimeout(timer);
  }, [isDirectSignIn]);

  const { login, register: registerApi } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => login({ email: email.trim(), password: password.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.replace('/(tabs)/home' as any);
    },
    onError: (error) => {
      const targetEmail = email.trim();
      if (error instanceof AppError) {
        if (error.code === 'USER_UNVERIFIED' || error.code === 'EMAIL_NOT_VERIFIED') {
          Alert.alert('Chưa xác thực', 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.', [
            { text: 'Xác thực ngay', onPress: () => router.push({ pathname: '/(auth)/verify-email', params: { email: targetEmail } }) },
            { text: 'Hủy', style: 'cancel' },
          ]);
        } else {
          Alert.alert('Đăng nhập thất bại', `[${error.code}] ${error.message}`);
        }
      } else {
        Alert.alert('Đăng nhập thất bại', 'Có lỗi xảy ra khi kết nối hệ thống. Vui lòng thử lại.');
      }
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: () =>
      registerApi({
        email: email.trim(),
        password: password.trim(),
        displayName: displayName.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        Alert.alert('Đăng ký thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Đăng ký thất bại', 'Có lỗi xảy ra khi tạo tài khoản');
      }
    },
  });

  // Send Forgot Password Request Mutation
  const sendRequestMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email: email.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setStep('forgot_done');
    },
    onError: (error) => {
      if (error instanceof AppError) {
        Alert.alert('Lỗi', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu.');
      }
    },
  });


  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    const emailError = validateEmail(email.trim());
    if (emailError) {
      Alert.alert('Lỗi', emailError);
      return;
    }
    loginMutation.mutate();
  };

  const handleRegister = () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (displayName.trim().length < 2) {
      Alert.alert('Lỗi', 'Tên hiển thị phải có ít nhất 2 ký tự');
      return;
    }
    const emailError = validateEmail(email.trim());
    if (emailError) {
      Alert.alert('Lỗi', emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Lỗi', passwordError);
      return;
    }
    registerMutation.mutate();
  };

  const handleSendRequest = () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Địa chỉ Email');
      return;
    }
    const emailError = validateEmail(email.trim());
    if (emailError) {
      Alert.alert('Lỗi', emailError);
      return;
    }
    sendRequestMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent />

      {/* Splash Screen */}
      {isSplash && (
        <Animated.View exiting={FadeOut.duration(500)} style={styles.splashContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {!isSplash && (
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
        >
          {/* Top Topographic Wave Header */}
          <View style={styles.headerWrapper}>
            <TopographicHeader triggerKey={step} />
          </View>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            <WelcomeSection step={step} setStep={setStep} colors={colors} />
            <SignInSection
              step={step}
              setStep={setStep}
              colors={colors}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleLogin={handleLogin}
              isPending={loginMutation.isPending}
            />
            <SignUpSection
              step={step}
              setStep={setStep}
              colors={colors}
              displayName={displayName}
              setDisplayName={setDisplayName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleRegister={handleRegister}
              isPending={registerMutation.isPending}
              openLegalModal={openLegalModal}
            />
            <ForgotRequestSection
              step={step}
              setStep={setStep}
              colors={colors}
              email={email}
              setEmail={setEmail}
              handleSendRequest={handleSendRequest}
              isPending={sendRequestMutation.isPending}
            />
            <ForgotDoneSection step={step} setStep={setStep} colors={colors} />
          </View>
        </KeyboardAwareScrollView>
      )}

      {/* Legal & Policy Modal */}
      <LegalPolicyModal
        visible={isLegalModalVisible}
        initialTab={legalModalTab}
        onClose={closeLegalModal}
      />
    </SafeAreaView>
  );
}
