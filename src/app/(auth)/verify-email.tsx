import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AppError } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialInput } from '@/components/material-input';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/api/auth.api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

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

  const handleVerify = async () => {
    if (!email.trim() || !code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Mã xác thực');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email: email.trim(), code: code.trim() });
      Alert.alert('Thành công', 'Tài khoản của bạn đã được xác thực!', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Xác thực thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Xác thực thất bại', 'Có lỗi xảy ra khi xác thực tài khoản');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email để nhận lại mã');
      return;
    }

    setResending(true);
    try {
      await authApi.resendVerification({ email: email.trim() });
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn.');
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Gửi lại thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Gửi lại thất bại', 'Có lỗi xảy ra khi yêu cầu mã xác thực mới');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <ThemedText type="title" style={styles.title}>
            Xác Thực Email
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Nhập mã gồm 6 chữ số chúng tôi vừa gửi đến email của bạn
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.form}>
            
            <MaterialInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!emailParam}
            />

            <MaterialInput
              label="Mã xác thực (6 số)"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <AnimatedPressable
              style={[styles.button, buttonAnimatedStyle, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPressIn={() => (buttonScale.value = withSpring(0.95))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              onPress={handleVerify}
              disabled={loading || resending}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText}>Xác Thực</ThemedText>
              )}
            </AnimatedPressable>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Chưa nhận được mã? </ThemedText>
              <Pressable onPress={handleResend} disabled={resending || loading}>
                {resending ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 4 }} />
                ) : (
                  <ThemedText style={[styles.linkText, { color: colors.primary }, (resending || loading) && { opacity: 0.5 }]}>Gửi lại</ThemedText>
                )}
              </Pressable>
            </View>

            <View style={styles.backToLogin}>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Quay lại Đăng nhập</ThemedText>
                </Pressable>
              </Link>
            </View>

          </View>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.two,
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
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    elevation: 4,
  },
  form: {
    gap: Spacing.two,
  },
  button: {
    height: 54,
    borderRadius: 16,
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
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '700',
    fontSize: 14,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});

