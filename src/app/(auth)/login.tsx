import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn, FadeOut, FadeInUp, FadeInDown, withSpring, useAnimatedStyle, useSharedValue, LinearTransition, Easing } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialInput } from '@/components/material-input';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
// import { AnimatedIcon } from '@/components/animated-icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    // Start splash transition after a short delay
    const timer = setTimeout(() => {
      setIsSplash(false);
      SplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // Button Scale Animation
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleLogin = async (overrideEmail?: string, overridePassword?: string) => {
    const targetEmail = overrideEmail ?? email.trim();
    const targetPassword = overridePassword ?? password.trim();

    if (!targetEmail || !targetPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login({ email: targetEmail, password: targetPassword });
      router.replace('/');
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
        Alert.alert('Đăng nhập thất bại', 'Có lỗi xảy ra khi gọi backend API. Vui lòng kiểm tra lại tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Splash Screen */}
        {isSplash && (
          <Animated.View exiting={FadeOut.duration(800)} style={styles.splashContainer}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.splashLogo} 
              resizeMode="contain" 
            />
          </Animated.View>
        )}

        {/* Main Form */}
        {!isSplash && (
          <View style={styles.mainContent}>
            <Animated.View entering={FadeInDown.duration(1000).easing(Easing.out(Easing.cubic))} style={styles.titleContainer}>
              <ThemedText type="title" style={styles.title}>
                Đăng nhập
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Nền tảng phỏng vấn AI thông minh
              </ThemedText>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(1000).easing(Easing.out(Easing.cubic))} style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <View style={styles.form}>
            
            <MaterialInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <MaterialInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable>
                  <ThemedText style={styles.forgotPasswordText}>Quên mật khẩu?</ThemedText>
                </Pressable>
              </Link>
            </View>

            <AnimatedPressable
              style={[styles.button, buttonAnimatedStyle, { opacity: loading ? 0.7 : 1 }]}
              onPressIn={() => (buttonScale.value = withSpring(0.95))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText}>Đăng Nhập</ThemedText>
              )}
            </AnimatedPressable>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
              <Link href="/register" asChild>
                <Pressable>
                  <ThemedText style={styles.linkText}>Tạo tài khoản mới</ThemedText>
                </Pressable>
              </Link>
            </View>

          </View>
          </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  splashContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 140,
    height: 140,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 28,
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 15,
  },
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  form: {
    gap: Spacing.two,
  },
  button: {
    height: 56,
    backgroundColor: '#3525CD',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
    shadowColor: '#3525CD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    color: '#3525CD',
    fontWeight: '700',
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -Spacing.one,
  },
  forgotPasswordText: {
    color: '#3525CD',
    fontSize: 14,
    fontWeight: '600',
  },
});
