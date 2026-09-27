import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { StaggeredTitle, CenterExpandView } from '@/components/ui/animated-auth-elements';
import { styles } from '@/styles/login.styles';
import { BaseAuthSectionProps } from './types';
import { PolicyTab } from '@/components/ui/legal-policy-modal';

interface SignUpSectionProps extends BaseAuthSectionProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  handleRegister: () => void;
  isPending: boolean;
  openLegalModal: (tab: PolicyTab) => void;
}

export const SignUpSection = ({
  step,
  setStep,
  colors,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleRegister,
  isPending,
  openLegalModal,
}: SignUpSectionProps) => {
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  if (step !== 'signup') return null;

  return (
    <View style={styles.signInSection}>
      <View style={styles.signInHeader}>
        <StaggeredTitle text="Đăng ký" style={styles.signInTitle} triggerKey={step} />
      </View>

      <View style={styles.formStack}>
        <CenterExpandView delay={120} triggerKey={step} style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Họ và tên</ThemedText>
          <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
            <Ionicons
              name="person-outline"
              size={18}
              color={nameFocused ? colors.primary : '#9CA3AF'}
            />
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
        </CenterExpandView>

        <CenterExpandView delay={220} triggerKey={step} style={styles.fieldGroup}>
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

        <CenterExpandView delay={320} triggerKey={step} style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Mật khẩu (ít nhất 6 ký tự)</ThemedText>
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

        <CenterExpandView delay={390} triggerKey={step} style={styles.legalConsentRow}>
          <ThemedText style={styles.legalConsentText}>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <ThemedText style={styles.legalLink} onPress={() => openLegalModal('terms')}>
              Điều khoản dịch vụ
            </ThemedText>{' '}
            và{' '}
            <ThemedText style={styles.legalLink} onPress={() => openLegalModal('privacy')}>
              Chính sách bảo mật
            </ThemedText>{' '}
            của Nexora.
          </ThemedText>
        </CenterExpandView>

        <CenterExpandView delay={420} triggerKey={step}>
          <TouchableScale
            style={styles.submitButton}
            onPress={handleRegister}
            disabled={isPending}
            scaleTo={0.96}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Tạo tài khoản</ThemedText>
            )}
          </TouchableScale>
        </CenterExpandView>
      </View>

      <CenterExpandView delay={500} triggerKey={step} style={styles.footerRow}>
        <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
        <Pressable hitSlop={8} onPress={() => setStep('signin')}>
          <ThemedText style={styles.linkText}>Đăng nhập ngay</ThemedText>
        </Pressable>
      </CenterExpandView>
    </View>
  );
};
