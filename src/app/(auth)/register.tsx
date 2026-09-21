import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { MaterialInput } from '@/components/material-input';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { register: registerApi } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const registerMutation = useMutation({
    mutationFn: () =>
      registerApi({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
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

  const handleRegister = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    registerMutation.mutate();
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
              Tạo Tài Khoản Mới
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Bắt đầu hành trình luyện phỏng vấn & phát triển sự nghiệp cùng AI
            </ThemedText>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.cubic))}>
            <GlassCard hasGlow glowColor={colors.glowSecondary} style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Thông Tin Đăng Ký
              </ThemedText>

              <View style={styles.formStack}>
                <MaterialInput
                  label="Họ và tên"
                  leftIcon="person-outline"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />

                <MaterialInput
                  label="Địa chỉ Email"
                  leftIcon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <MaterialInput
                  label="Mật khẩu (ít nhất 6 ký tự)"
                  leftIcon="lock-closed-outline"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />

                <TouchableScale
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Tạo Tài Khoản</ThemedText>
                  )}
                </TouchableScale>
              </View>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
                <Link href="/(auth)/login" asChild>
                  <Pressable hitSlop={8}>
                    <ThemedText style={[styles.linkText, { color: colors.primary }]}>Đăng nhập ngay</ThemedText>
                  </Pressable>
                </Link>
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
    maxWidth: 320,
    lineHeight: 19,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.one,
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
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
