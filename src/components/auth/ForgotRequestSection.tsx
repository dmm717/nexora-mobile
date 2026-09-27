import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { StaggeredTitle, CenterExpandView } from '@/components/ui/animated-auth-elements';
import { styles } from '@/styles/login.styles';
import { BaseAuthSectionProps } from './types';

interface ForgotRequestSectionProps extends BaseAuthSectionProps {
  email: string;
  setEmail: (val: string) => void;
  handleSendRequest: () => void;
  isPending: boolean;
}

export const ForgotRequestSection = ({
  step,
  setStep,
  colors,
  email,
  setEmail,
  handleSendRequest,
  isPending,
}: ForgotRequestSectionProps) => {
  const [emailFocused, setEmailFocused] = useState(false);

  if (step !== 'forgot_request') return null;

  return (
    <View style={styles.signInSection}>
      <View style={styles.signInHeader}>
        <StaggeredTitle text="Quên mật khẩu" style={styles.signInTitle} triggerKey={step} />
      </View>

      <View style={styles.formStack}>
        <CenterExpandView delay={120} triggerKey={step} style={styles.fieldGroup}>
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

        <CenterExpandView delay={240} triggerKey={step}>
          <TouchableScale
            style={styles.submitButton}
            onPress={handleSendRequest}
            disabled={isPending}
            scaleTo={0.96}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Gửi yêu cầu khôi phục</ThemedText>
            )}
          </TouchableScale>
        </CenterExpandView>

        <CenterExpandView delay={420} triggerKey={step} style={styles.footerRow}>
          <Pressable hitSlop={8} onPress={() => setStep('signin')}>
            <ThemedText style={styles.footerText}>Quay lại Đăng nhập</ThemedText>
          </Pressable>
        </CenterExpandView>
      </View>
    </View>
  );
};
