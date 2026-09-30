import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CenterExpandView, StaggeredTitle } from '@/components/ui/animated-auth-elements';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/login.styles';
import { BaseAuthSectionProps } from './types';

export const WelcomeSection = ({ step, setStep }: BaseAuthSectionProps) => {
  if (step !== 'welcome') return null;

  return (
    <View style={styles.welcomeSection}>
      <View style={styles.welcomeTextGroup}>
        <StaggeredTitle text="Chào mừng" style={styles.welcomeTitle} triggerKey={step} />
        <CenterExpandView delay={120} triggerKey={step}>
          <ThemedText style={styles.welcomeSubtitle}>
            Nền tảng phỏng vấn thông minh & huấn luyện kỹ năng sự nghiệp hàng đầu Nexora AI.
          </ThemedText>
        </CenterExpandView>
      </View>

      <CenterExpandView delay={240} triggerKey={step} style={styles.welcomeActionRow}>
        <Pressable onPress={() => setStep('signin')} hitSlop={12}>
          <ThemedText style={styles.continueText}>Tiếp tục</ThemedText>
        </Pressable>
        <TouchableScale
          style={styles.continueCircle}
          onPress={() => setStep('signin')}
          scaleTo={0.92}
        >
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableScale>
      </CenterExpandView>
    </View>
  );
};
