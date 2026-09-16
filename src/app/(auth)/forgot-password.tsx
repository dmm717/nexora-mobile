import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialInput } from '@/components/material-input';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(true);
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Quên mật khẩu?
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Nhập email của bạn và chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
          {submitted ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.successContainer}>
              <View style={styles.successIcon}>
                <ThemedText style={{ fontSize: 40 }}>📩</ThemedText>
              </View>
              <ThemedText style={styles.successText}>
                Liên kết khôi phục đã được gửi! Vui lòng kiểm tra hộp thư đến của bạn (và cả thư mục rác).
              </ThemedText>
              
              <Link href="/login" asChild>
                <AnimatedPressable
                  style={[styles.button, buttonAnimatedStyle, { marginTop: Spacing.four }]}
                  onPressIn={() => (buttonScale.value = withSpring(0.95))}
                  onPressOut={() => (buttonScale.value = withSpring(1))}
                >
                  <ThemedText style={styles.buttonText}>Quay lại Đăng nhập</ThemedText>
                </AnimatedPressable>
              </Link>
            </Animated.View>
          ) : (
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
                style={[styles.button, buttonAnimatedStyle, { opacity: loading ? 0.7 : 1 }]}
                onPressIn={() => (buttonScale.value = withSpring(0.95))}
                onPressOut={() => (buttonScale.value = withSpring(1))}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Gửi Yêu Cầu</ThemedText>
                )}
              </AnimatedPressable>

              <View style={styles.footer}>
                <Link href="/login" asChild>
                  <Pressable>
                    <ThemedText style={styles.linkText}>Quay lại Đăng nhập</ThemedText>
                  </Pressable>
                </Link>
              </View>
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3525CD20',
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
    color: '#3525CD',
    fontWeight: '700',
    fontSize: 14,
  },
});
