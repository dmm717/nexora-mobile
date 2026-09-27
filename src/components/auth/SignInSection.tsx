import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { StaggeredTitle, CenterExpandView } from '@/components/ui/animated-auth-elements';
import { styles } from '@/styles/login.styles';
import { BaseAuthSectionProps } from './types';

interface SignInSectionProps extends BaseAuthSectionProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  handleLogin: () => void;
  isPending: boolean;
}

export const SignInSection = ({
  step,
  setStep,
  colors,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  isPending,
}: SignInSectionProps) => {
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  if (step !== 'signin') return null;

  return (
    <View style={styles.signInSection}>
      <View style={styles.signInHeader}>
        <StaggeredTitle text="Đăng nhập" style={styles.signInTitle} triggerKey={step} />
      </View>

      <View style={styles.formStack}>
        <CenterExpandView delay={140} triggerKey={step} style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Địa chỉ Email</ThemedText>
          <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={emailFocused ? colors.primary : '#9CA3AF'}
            />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="demo@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </CenterExpandView>

        <CenterExpandView delay={240} triggerKey={step} style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Mật khẩu</ThemedText>
          <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={passwordFocused ? colors.primary : '#9CA3AF'}
            />
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
        </CenterExpandView>

        <CenterExpandView delay={320} triggerKey={step} style={styles.optionsRow}>
          <Pressable hitSlop={8} onPress={() => setStep('forgot_request')}>
            <ThemedText style={styles.forgotText}>Quên mật khẩu?</ThemedText>
          </Pressable>
        </CenterExpandView>

        <CenterExpandView delay={400} triggerKey={step}>
          <TouchableScale
            style={styles.submitButton}
            onPress={handleLogin}
            disabled={isPending}
            scaleTo={0.96}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Đăng nhập</ThemedText>
            )}
          </TouchableScale>
        </CenterExpandView>
      </View>

      <CenterExpandView delay={480} triggerKey={step} style={styles.footerRow}>
        <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
        <Pressable hitSlop={8} onPress={() => setStep('signup')}>
          <ThemedText style={styles.linkText}>Đăng ký ngay</ThemedText>
        </Pressable>
      </CenterExpandView>
    </View>
  );
};
