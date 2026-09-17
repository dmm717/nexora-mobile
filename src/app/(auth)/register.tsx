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
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: registerApi } = useAuth();
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

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
      });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Đăng ký thất bại', `[${error.code}] ${error.message}`);
      } else {
        Alert.alert('Đăng ký thất bại', 'Có lỗi xảy ra khi tạo tài khoản');
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
            Tạo tài khoản mới
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Bắt đầu trải nghiệm phỏng vấn và huấn luyện AI
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
          <View style={styles.form}>
            
            <MaterialInput
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

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

            <AnimatedPressable
              style={[styles.button, buttonAnimatedStyle, { opacity: loading ? 0.7 : 1 }]}
              onPressIn={() => (buttonScale.value = withSpring(0.95))}
              onPressOut={() => (buttonScale.value = withSpring(1))}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText}>Tạo Tài Khoản</ThemedText>
              )}
            </AnimatedPressable>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <ThemedText style={styles.linkText}>Đăng nhập ngay</ThemedText>
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
});
