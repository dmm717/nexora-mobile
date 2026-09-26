import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
  Image,
  ScrollView,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppError } from '@/api/types';
import { authApi } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { TopographicHeader } from '@/components/ui/topographic-header';
import { StaggeredTitle, CenterExpandView } from '@/components/ui/animated-auth-elements';
import { LegalPolicyModal, PolicyTab } from '@/components/ui/legal-policy-modal';
import { styles } from '@/styles/login.styles';

export type AuthStep =
  | 'welcome'
  | 'signin'
  | 'signup'
  | 'forgot_request'
  | 'forgot_done';

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

  const closeLegalModal = React.useCallback(() => {
    setIsLegalModalVisible(false);
  }, []);

  // Form Fields State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Input Focus States
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/[A-Z]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ viết hoa';
    if (!/[a-z]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ viết thường';
    if (!/[0-9]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một chữ số';
    if (!/[^a-zA-Z0-9]/.test(pass)) return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    return null;
  };

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return 'Vui lòng nhập định dạng email hợp lệ';
    }
    return null;
  };

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

            {/* STEP 1: WELCOME SCREEN */}
            {step === 'welcome' && (
              <View style={styles.welcomeSection}>
                <View style={styles.welcomeTextGroup}>
                  <StaggeredTitle text="Chào mừng" style={styles.welcomeTitle} triggerKey={step} />
                  <CenterExpandView delay={120} triggerKey={step}>
                    <ThemedText style={styles.welcomeSubtitle}>
                      Nền tảng phỏng vấn thông minh & huấn luyện kỹ năng sự nghiệp hàng đầu Nexora AI.
                    </ThemedText>
                  </CenterExpandView>
                </View>

                {/* Continue Action */}
                <CenterExpandView delay={240} triggerKey={step} style={styles.welcomeActionRow}>
                  <Pressable onPress={() => setStep('signin')} hitSlop={12}>
                    <ThemedText style={styles.continueText}>Tiếp tục</ThemedText>
                  </Pressable>
                  <TouchableScale
                    style={styles.continueCircle}
                    onPress={() => setStep('signin')}
                    scaleTo={0.92}
                  >
                    <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                  </TouchableScale>
                </CenterExpandView>
              </View>
            )}

            {/* STEP 2: SIGN IN SCREEN */}
            {step === 'signin' && (
              <View style={styles.signInSection}>
                {/* Title */}
                <View style={styles.signInHeader}>
                  <StaggeredTitle text="Đăng nhập" style={styles.signInTitle} triggerKey={step} />
                </View>

                {/* Form Inputs */}
                <View style={styles.formStack}>
                  {/* Email Field */}
                  <CenterExpandView delay={140} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Địa chỉ Email</ThemedText>
                    <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={emailFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="demo@email.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                  </CenterExpandView>

                  {/* Password Field */}
                  <CenterExpandView delay={240} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Mật khẩu</ThemedText>
                    <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={passwordFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#9CA3AF"
                        />
                      </Pressable>
                    </View>
                  </CenterExpandView>

                  {/* Options Row: Forgot Password */}
                  <CenterExpandView delay={320} triggerKey={step} style={styles.optionsRow}>
                    <Pressable hitSlop={8} onPress={() => setStep('forgot_request')}>
                      <ThemedText style={styles.forgotText}>Quên mật khẩu?</ThemedText>
                    </Pressable>
                  </CenterExpandView>

                  {/* Primary Sign In Button */}
                  <CenterExpandView delay={400} triggerKey={step}>
                    <TouchableScale
                      style={styles.submitButton}
                      onPress={handleLogin}
                      disabled={loginMutation.isPending}
                      scaleTo={0.96}
                    >
                      {loginMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <ThemedText style={styles.submitButtonText}>Đăng nhập</ThemedText>
                      )}
                    </TouchableScale>
                  </CenterExpandView>
                </View>

                {/* Bottom Sign Up Link */}
                <CenterExpandView delay={480} triggerKey={step} style={styles.footerRow}>
                  <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
                  <Pressable hitSlop={8} onPress={() => setStep('signup')}>
                    <ThemedText style={styles.linkText}>Đăng ký ngay</ThemedText>
                  </Pressable>
                </CenterExpandView>
              </View>
            )}

            {/* STEP 3: SIGN UP / REGISTER SCREEN */}
            {step === 'signup' && (
              <View style={styles.signInSection}>
                {/* Title */}
                <View style={styles.signInHeader}>
                  <StaggeredTitle text="Đăng ký" style={styles.signInTitle} triggerKey={step} />
                </View>

                {/* Form Inputs */}
                <View style={styles.formStack}>
                  {/* Full Name Field */}
                  <CenterExpandView delay={120} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Họ và tên</ThemedText>
                    <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color={nameFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Nguyễn Văn A"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="words"
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                      />
                    </View>
                  </CenterExpandView>

                  {/* Email Field */}
                  <CenterExpandView delay={220} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Địa chỉ Email</ThemedText>
                    <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={emailFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="demo@email.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                  </CenterExpandView>

                  {/* Password Field */}
                  <CenterExpandView delay={320} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Mật khẩu (ít nhất 6 ký tự)</ThemedText>
                    <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={passwordFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#9CA3AF"
                        />
                      </Pressable>
                    </View>
                  </CenterExpandView>

                  {/* Legal Consent Text */}
                  <CenterExpandView delay={390} triggerKey={step} style={styles.legalConsentRow}>
                    <ThemedText style={styles.legalConsentText}>
                      Bằng việc đăng ký, bạn đồng ý với{' '}
                      <ThemedText style={styles.legalLink} onPress={() => openLegalModal('terms')}>
                        Điều khoản dịch vụ
                      </ThemedText>{' '}
                      và{' '}
                      <ThemedText style={styles.legalLink} onPress={() => openLegalModal('privacy')}>
                        Chính sách bảo mật
                      </ThemedText>{' '}
                      của Nexora.
                    </ThemedText>
                  </CenterExpandView>

                  {/* Primary Register Button */}
                  <CenterExpandView delay={420} triggerKey={step}>
                    <TouchableScale
                      style={styles.submitButton}
                      onPress={handleRegister}
                      disabled={registerMutation.isPending}
                      scaleTo={0.96}
                    >
                      {registerMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <ThemedText style={styles.submitButtonText}>Tạo tài khoản</ThemedText>
                      )}
                    </TouchableScale>
                  </CenterExpandView>
                </View>

                {/* Bottom Sign In Link */}
                <CenterExpandView delay={500} triggerKey={step} style={styles.footerRow}>
                  <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
                  <Pressable hitSlop={8} onPress={() => setStep('signin')}>
                    <ThemedText style={styles.linkText}>Đăng nhập ngay</ThemedText>
                  </Pressable>
                </CenterExpandView>
              </View>
            )}

            {/* STEP 4: FORGOT PASSWORD REQUEST OTP */}
            {step === 'forgot_request' && (
              <View style={styles.signInSection}>
                <View style={styles.signInHeader}>
                  <StaggeredTitle text="Quên mật khẩu" style={styles.signInTitle} triggerKey={step} />
                </View>

                <View style={styles.formStack}>
                  {/* Email Field */}
                  <CenterExpandView delay={120} triggerKey={step} style={styles.fieldGroup}>
                    <ThemedText style={styles.fieldLabel}>Địa chỉ Email</ThemedText>
                    <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={emailFocused ? colors.primary : '#9CA3AF'}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="demo@email.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                  </CenterExpandView>

                  {/* Primary Submit Button */}
                  <CenterExpandView delay={240} triggerKey={step}>
                    <TouchableScale
                      style={styles.submitButton}
                      onPress={handleSendRequest}
                      disabled={sendRequestMutation.isPending}
                      scaleTo={0.96}
                    >
                      {sendRequestMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <ThemedText style={styles.submitButtonText}>Gửi yêu cầu khôi phục</ThemedText>
                      )}
                    </TouchableScale>
                  </CenterExpandView>

                  <CenterExpandView delay={420} triggerKey={step} style={styles.footerRow}>
                    <Pressable hitSlop={8} onPress={() => setStep('signin')}>
                      <ThemedText style={styles.footerText}>Quay lại Đăng nhập</ThemedText>
                    </Pressable>
                  </CenterExpandView>
                </View>
              </View>
            )}

            {/* STEP 6: RESET SUCCESS CARD */}
            {step === 'forgot_done' && (
              <View style={styles.successContainer}>
                <CenterExpandView delay={120} triggerKey={step}>
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
                  </View>
                </CenterExpandView>
                <CenterExpandView delay={200} triggerKey={step}>
                  <ThemedText style={styles.successText}>
                    Nếu email thuộc một tài khoản hợp lệ, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ này. Vui lòng kiểm tra cả hòm thư Spam hoặc Thư rác.
                  </ThemedText>
                </CenterExpandView>

                <CenterExpandView delay={320} triggerKey={step}>
                  <TouchableScale style={styles.submitButton} onPress={() => setStep('signin')} scaleTo={0.96}>
                    <ThemedText style={styles.submitButtonText}>Quay lại đăng nhập</ThemedText>
                  </TouchableScale>
                </CenterExpandView>
              </View>
            )}

          </View>
        </KeyboardAwareScrollView>
      )}

      {/* Legal Policy Modal */}
      <LegalPolicyModal
        visible={isLegalModalVisible}
        initialTab={legalModalTab}
        onClose={closeLegalModal}
      />
    </SafeAreaView>
  );
}


