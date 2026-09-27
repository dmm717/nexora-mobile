import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { CenterExpandView } from '@/components/ui/animated-auth-elements';
import { styles } from '@/styles/login.styles';
import { BaseAuthSectionProps } from './types';

export const ForgotDoneSection = ({
  step,
  setStep,
  colors,
}: BaseAuthSectionProps) => {
  if (step !== 'forgot_done') return null;

  return (
    <View style={styles.successContainer}>
      <CenterExpandView delay={120} triggerKey={step}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
        </View>
      </CenterExpandView>
      <CenterExpandView delay={200} triggerKey={step}>
        <ThemedText style={styles.successText}>
          Nếu email thuộc một tài khoản hợp lệ, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ này. Vui lòng kiểm tra cả hòm thư Spam hoặc Thư rác.
        </ThemedText>
      </CenterExpandView>

      <CenterExpandView delay={320} triggerKey={step}>
        <TouchableScale style={styles.submitButton} onPress={() => setStep('signin')} scaleTo={0.96}>
          <ThemedText style={styles.submitButtonText}>Quay lại đăng nhập</ThemedText>
        </TouchableScale>
      </CenterExpandView>
    </View>
  );
};
