import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeOut, FadeInUp, FadeInDown, Easing } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { MaterialInput } from '@/components/material-input';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const handleLogin = async () => {
    const targetEmail = email.trim();
    const targetPassword = password.trim();

    if (!targetEmail || !targetPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login({ email: targetEmail, password: targetPassword });
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code === 'USER_UNVERIFIED' || error.code === 'EMAIL_NOT_VERIFIED') {
          Alert.alert('Chưa xác thực', 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.', [
            { text: 'Xác thực ngay', onPress: () => router.push({ pathname: '/(auth)/verify-email', params: { email: targetEmail } }) },
            { text: 'Hủy', style: 'cancel' }
          ]);
        } else {
          Alert.alert('Đăng nhập thất bại', `[${error.code}] ${error.message}`);
        }
      } else {
        Alert.alert('Đăng nhập thất bại', 'Có lỗi xảy ra khi kết nối hệ thống. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
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
                    disabled={loading}
                  >
                    {loading ? (
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 130,
    height: 130,
  },
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
    width: 64,
    height: 64,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  formStack: {
    gap: Spacing.two,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
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
