import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeOut, FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
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
import { styles } from './login.styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { login } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const loginMutation = useMutation({
    mutationFn: () =>
      login({ email: email.trim(), password: password.trim() }),
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

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>

        {/* Splash Screen */}
        {isSplash && (
          <Animated.View exiting={FadeOut.duration(600)} style={styles.splashContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {/* Main Login Form */}
        {!isSplash && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Brand Header */}
            <Animated.View entering={FadeInDown.duration(800).easing(Easing.out(Easing.cubic))} style={styles.brandHeader}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <ThemedText type="title" style={styles.title}>
                Nexora AI
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Nền tảng phỏng vấn & huấn luyện kỹ năng sự nghiệp thông minh
              </ThemedText>
            </Animated.View>

            {/* Glassmorphic Form Card */}
            <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.cubic))}>
              <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.card}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  Đăng Nhập Tài Khoản
                </ThemedText>

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

                  <MaterialInput
                    label="Mật khẩu"
                    leftIcon="lock-closed-outline"
                    isPassword
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="password"
                  />

                  <View style={styles.forgotRow}>
                    <Link href="/(auth)/forgot-password" asChild>
                      <Pressable hitSlop={8}>
                        <ThemedText style={[styles.forgotText, { color: colors.primary }]}>
                          Quên mật khẩu?
                        </ThemedText>
                      </Pressable>
                    </Link>
                  </View>

                  <TouchableScale
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleLogin}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <ThemedText style={styles.submitButtonText}>Đăng Nhập</ThemedText>
                    )}
                  </TouchableScale>
                </View>

                <View style={styles.footerRow}>
                  <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
                  <Link href="/(auth)/register" asChild>
                    <Pressable hitSlop={8}>
                      <ThemedText style={[styles.linkText, { color: colors.primary }]}>Tạo tài khoản mới</ThemedText>
                    </Pressable>
                  </Link>
                </View>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </AmbientBackground>
  );
}
