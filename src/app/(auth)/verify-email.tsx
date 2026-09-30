import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { MaterialInput } from '@/components/material-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { styles } from '@/styles/verify-email.styles';
import { toast } from '@/components/ui/toast/ToastProvider';

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(emailParam || '');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const resendMutation = useMutation({
    mutationFn: () =>
      authApi.resendVerification({ email: email.trim() }),
    onSuccess: () => {
      toast.success('Liên kết xác thực mới đã được gửi đến email của bạn.');
      setResendCooldown(60);
    },
    onError: (error) => {
      if (error instanceof AppError) {
        toast.error(`[${error.code}] ${error.message}`);
      } else {
        toast.error('Có lỗi xảy ra khi gửi lại email');
      }
    },
  });

  const handleResend = () => {
    if (resendCooldown > 0) return;
    if (!email.trim()) {
      toast.error('Vui lòng nhập Email để nhận lại liên kết');
      return;
    }
    resendMutation.mutate();
  };

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
              Kiểm tra Email
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Xác thực tài khoản để bắt đầu trải nghiệm
            </ThemedText>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.cubic))}>
            <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.card}>
              <View style={styles.formStack}>
                
                <ThemedText style={{ textAlign: 'center', marginBottom: 24, fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>
                  Chúng tôi đã gửi một liên kết xác minh đến email của bạn. Vui lòng mở email (bao gồm cả thư mục Spam) và nhấn vào liên kết để kích hoạt tài khoản.
                </ThemedText>

                <MaterialInput
                  label="Địa chỉ Email"
                  leftIcon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!emailParam}
                />

                <TouchableScale
                  style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: 12 }]}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <ThemedText style={styles.submitButtonText}>Tôi đã xác thực xong</ThemedText>
                </TouchableScale>

                <View style={styles.resendRow}>
                  <ThemedText style={styles.footerText}>Không tìm thấy email? </ThemedText>
                  <Pressable onPress={handleResend} disabled={isResending || resendCooldown > 0} hitSlop={8}>
                    {isResending ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 4 }} />
                    ) : (
                      <ThemedText style={[styles.linkText, { color: colors.primary }, (isResending || resendCooldown > 0) && { opacity: 0.5 }]}>
                        {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : 'Gửi lại'}
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
