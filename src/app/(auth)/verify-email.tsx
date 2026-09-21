import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { MaterialInput } from '@/components/material-input';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');

  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const verifyMutation = useMutation({
    mutationFn: () =>
      authApi.verifyEmail({ email: email.trim(), code: code.trim() }),
    onSuccess: () => {
      Alert.alert('Thành công', 'Tài khoản của bạn đã được xác thực!', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') },
      ]);
    },
    onError: (error) => {
      if (error instanceof AppError) {
        Alert.alert('Xác thực thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Xác thực thất bại', 'Có lỗi xảy ra khi xác thực tài khoản');
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: () =>
      authApi.resendVerification({ email: email.trim() }),
    onSuccess: () => {
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn.');
    },
    onError: (error) => {
      if (error instanceof AppError) {
        Alert.alert('Gửi lại thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Gửi lại thất bại', 'Có lỗi xảy ra khi yêu cầu mã xác thực mới');
      }
    },
  });

  const handleVerify = () => {
    if (!email.trim() || !code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Mã xác thực');
      return;
    }
    verifyMutation.mutate();
  };

  const handleResend = () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email để nhận lại mã');
      return;
    }
    resendMutation.mutate();
  };

  const isLoading = verifyMutation.isPending;
  const isResending = resendMutation.isPending;

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
            <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <ThemedText type="title" style={styles.title}>
              Xác Thực Email
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Nhập mã gồm 6 chữ số vừa được gửi đến email của bạn
            </ThemedText>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.cubic))}>
            <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.card}>
              <View style={styles.formStack}>
                <MaterialInput
                  label="Địa chỉ Email"
                  leftIcon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!emailParam}
                />

                <MaterialInput
                  label="Mã OTP (6 số)"
                  leftIcon="key-outline"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <TouchableScale
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleVerify}
                  disabled={isLoading || isResending}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Xác Thực Tài Khoản</ThemedText>
                  )}
                </TouchableScale>

                <View style={styles.resendRow}>
                  <ThemedText style={styles.footerText}>Chưa nhận được mã? </ThemedText>
                  <Pressable onPress={handleResend} disabled={isResending || isLoading} hitSlop={8}>
                    {isResending ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 4 }} />
                    ) : (
                      <ThemedText style={[styles.linkText, { color: colors.primary }, (isResending || isLoading) && { opacity: 0.5 }]}>
                        Gửi lại mã
                      </ThemedText>
                    )}
                  </Pressable>
                </View>

                <View style={styles.backRow}>
                  <Link href="/(auth)/login" asChild>
                    <Pressable hitSlop={8}>
                      <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Quay lại Đăng nhập</ThemedText>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

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
    maxWidth: 300,
    lineHeight: 19,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formStack: {
    gap: Spacing.two,
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
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
  backRow: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
