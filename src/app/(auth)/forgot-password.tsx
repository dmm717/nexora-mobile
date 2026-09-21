import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { MaterialInput } from '@/components/material-input';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const handleSendRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setStep('reset');
      Alert.alert('Thành công', 'Mã xác thực đã được gửi tới email của bạn.');
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Lỗi', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu khôi phục mật khẩu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã xác thực (OTP) và Mật khẩu mới.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      });
      setResetDone(true);
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Lỗi', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Lỗi', 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(800).easing(Easing.out(Easing.cubic))} style={styles.brandHeader}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
            <ThemedText type="title" style={styles.title}>
              {resetDone ? 'Khôi Phục Thành Công' : step === 'request' ? 'Quên Mật Khẩu?' : 'Đặt Lại Mật Khẩu'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {resetDone
                ? 'Mật khẩu của bạn đã được cập nhật thành công.'
                : step === 'request'
                ? 'Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.'
                : `Nhập mã OTP đã gửi tới ${email} và mật khẩu mới.`}
            </ThemedText>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.cubic))}>
            <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.card}>
              {resetDone ? (
                <ResetDoneSuccessCard colors={colors} />
              ) : step === 'request' ? (
                <RequestOtpStepCard
                  email={email}
                  setEmail={setEmail}
                  colors={colors}
                  loading={loading}
                  onSendRequest={handleSendRequest}
                  onSwitchToReset={() => setStep('reset')}
                />
              ) : (
                <ResetPasswordStepCard
                  email={email}
                  setEmail={setEmail}
                  code={code}
                  setCode={setCode}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  colors={colors}
                  loading={loading}
                  onResetPassword={handleResetPassword}
                  onSwitchToRequest={() => setStep('request')}
                />
              )}
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const ResetDoneSuccessCard = React.memo(({ colors }: { colors: any }) => (
  <View style={styles.successContainer}>
    <View style={[styles.successIcon, { backgroundColor: colors.accentLight }]}>
      <ThemedText style={{ fontSize: 36 }}>✅</ThemedText>
    </View>
    <ThemedText style={styles.successText}>
      Bạn có thể đăng nhập ngay bây giờ bằng mật khẩu mới vừa thiết lập.
    </ThemedText>
    
    <Link href="/(auth)/login" asChild>
      <TouchableScale style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: Spacing.three }]}>
        <ThemedText style={styles.submitButtonText}>Đăng Nhập Ngay</ThemedText>
      </TouchableScale>
    </Link>
  </View>
));

const RequestOtpStepCard = React.memo(({
  email,
  setEmail,
  colors,
  loading,
  onSendRequest,
  onSwitchToReset,
}: {
  email: string;
  setEmail: (email: string) => void;
  colors: any;
  loading: boolean;
  onSendRequest: () => void;
  onSwitchToReset: () => void;
}) => (
  <View style={styles.formStack}>
    <MaterialInput
      label="Địa chỉ Email"
      leftIcon="mail-outline"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
    />

    <TouchableScale
      style={[styles.submitButton, { backgroundColor: colors.primary }]}
      onPress={onSendRequest}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <ThemedText style={styles.submitButtonText}>Gửi Mã OTP Khôi Phục</ThemedText>
      )}
    </TouchableScale>

    <TouchableOpacity onPress={onSwitchToReset} style={styles.subLink}>
      <ThemedText style={[styles.linkText, { color: colors.primary }]}>
        Đã có mã OTP? Nhập mật khẩu mới
      </ThemedText>
    </TouchableOpacity>

    <View style={styles.footerRow}>
      <Link href="/(auth)/login" asChild>
        <Pressable hitSlop={8}>
          <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Quay lại Đăng nhập</ThemedText>
        </Pressable>
      </Link>
    </View>
  </View>
));

const ResetPasswordStepCard = React.memo(({
  email,
  setEmail,
  code,
  setCode,
  newPassword,
  setNewPassword,
  colors,
  loading,
  onResetPassword,
  onSwitchToRequest,
}: {
  email: string;
  setEmail: (email: string) => void;
  code: string;
  setCode: (code: string) => void;
  newPassword: string;
  setNewPassword: (pwd: string) => void;
  colors: any;
  loading: boolean;
  onResetPassword: () => void;
  onSwitchToRequest: () => void;
}) => (
  <View style={styles.formStack}>
    <MaterialInput
      label="Email"
      leftIcon="mail-outline"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
    />

    <MaterialInput
      label="Mã OTP (6 chữ số)"
      leftIcon="key-outline"
      value={code}
      onChangeText={setCode}
      keyboardType="number-pad"
    />

    <MaterialInput
      label="Mật khẩu mới"
      leftIcon="lock-closed-outline"
      isPassword
      value={newPassword}
      onChangeText={setNewPassword}
    />

    <TouchableScale
      style={[styles.submitButton, { backgroundColor: colors.primary }]}
      onPress={onResetPassword}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <ThemedText style={styles.submitButtonText}>Đặt Lại Mật Khẩu</ThemedText>
      )}
    </TouchableScale>

    <TouchableOpacity onPress={onSwitchToRequest} style={styles.subLink}>
      <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Gửi lại mã OTP mới</ThemedText>
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 19,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formStack: {
    gap: Spacing.two,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  successText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    width: '100%',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  subLink: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
