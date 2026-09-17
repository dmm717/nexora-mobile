import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialInput } from '@/components/material-input';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {resetDone ? 'Thành công!' : step === 'request' ? 'Quên Mật Khẩu?' : 'Đặt Lai Mật Khẩu'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {resetDone
              ? 'Mật khẩu của bạn đã được cập nhật thành công.'
              : step === 'request'
              ? 'Nhập email của bạn và chúng tôi sẽ gửi mã xác thực khôi phục mật khẩu.'
              : `Nhập mã OTP đã gửi tới ${email} và mật khẩu mới.`}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {resetDone ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.accentLight }]}>
                <ThemedText style={{ fontSize: 40 }}>✅</ThemedText>
              </View>
              <ThemedText style={styles.successText}>
                Bạn có thể đăng nhập ngay bây giờ bằng mật khẩu mới.
              </ThemedText>
              
              <Link href="/(auth)/login" asChild>
                <AnimatedPressable
                  style={[styles.button, buttonAnimatedStyle, { backgroundColor: colors.primary, marginTop: Spacing.four }]}
                  onPressIn={() => (buttonScale.value = withSpring(0.95))}
                  onPressOut={() => (buttonScale.value = withSpring(1))}
                >
                  <ThemedText style={styles.buttonText}>Đăng Nhập Ngay</ThemedText>
                </AnimatedPressable>
              </Link>
            </Animated.View>
          ) : step === 'request' ? (
            <View style={styles.form}>
              <MaterialInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <AnimatedPressable
                style={[styles.button, buttonAnimatedStyle, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                onPressIn={() => (buttonScale.value = withSpring(0.95))}
                onPressOut={() => (buttonScale.value = withSpring(1))}
                onPress={handleSendRequest}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Gửi Yêu Cầu Khôi Phục</ThemedText>
                )}
              </AnimatedPressable>

              <TouchableOpacity onPress={() => setStep('reset')} style={{ alignItems: 'center', marginTop: Spacing.two }}>
                <ThemedText style={[styles.linkText, { color: colors.primary }]}>Đã có mã OTP? Nhập mật khẩu mới</ThemedText>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Quay lại Đăng nhập</ThemedText>
                  </Pressable>
                </Link>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <MaterialInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <MaterialInput
                label="Mã xác thực (OTP Code)"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />

              <MaterialInput
                label="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <AnimatedPressable
                style={[styles.button, buttonAnimatedStyle, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                onPressIn={() => (buttonScale.value = withSpring(0.95))}
                onPressOut={() => (buttonScale.value = withSpring(1))}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Đặt Lai Mật Khẩu</ThemedText>
                )}
              </AnimatedPressable>

              <TouchableOpacity onPress={() => setStep('request')} style={{ alignItems: 'center', marginTop: Spacing.two }}>
                <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Gửi lại mã OTP</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
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
  header: {
    marginBottom: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    marginTop: Spacing.two,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 15,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    elevation: 4,
  },
  form: {
    gap: Spacing.two,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  successText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
    width: '100%',
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
  linkText: {
    fontWeight: '700',
    fontSize: 14,
  },
});

