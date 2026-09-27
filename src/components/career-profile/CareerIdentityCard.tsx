import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/career-profile.styles';

interface CareerIdentityCardProps {
  identity: any;
  user: any;
  onboarding: any;
  colors: any;
}

export const CareerIdentityCard = ({ identity, user, onboarding, colors }: CareerIdentityCardProps) => {
  const router = useRouter();

  const displayName = identity?.displayName || user?.displayName || user?.displayName || 'Chưa cập nhật tên';
  const email = identity?.email || user?.email || 'Chưa cập nhật email';
  const avatarChar = (displayName || email || 'N').charAt(0).toUpperCase();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.identityRow}>
        <View style={styles.avatarCircle}>
          <ThemedText style={styles.avatarText}>{avatarChar}</ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.identityName}>{displayName}</ThemedText>
          <ThemedText style={styles.identityEmail}>{email}</ThemedText>
          <View style={styles.xpBadge}>
            <ThemedText style={styles.xpText}>
              {identity?.yearsOfExperience != null
                ? `${identity.yearsOfExperience} năm kinh nghiệm`
                : 'Chưa khai báo kinh nghiệm'}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

      <View style={styles.statusRow}>
        <ThemedText style={styles.statusLabel}>Trạng thái onboarding:</ThemedText>
        <ThemedText
          style={[
            styles.statusVal,
            { color: onboarding?.isComplete ? '#047857' : colors.warning },
          ]}
        >
          {onboarding?.isComplete ? 'Đã hoàn tất' : 'Chưa hoàn thiện'}
        </ThemedText>
      </View>

      <View style={styles.statusRow}>
        <ThemedText style={styles.statusLabel}>Quyền riêng tư dữ liệu:</ThemedText>
        <ThemedText style={styles.statusVal}>Được mã hóa & bảo vệ</ThemedText>
      </View>

      <TouchableScale
        style={[
          styles.btnOutline,
          { borderColor: colors.cardBorder, backgroundColor: colors.surface },
        ]}
        onPress={() => router.push('/(app)/account' as any)}
      >
        <Ionicons name="create-outline" size={15} color={colors.text} />
        <ThemedText style={[styles.btnText, { color: colors.text }]}>
          Cập nhật thông tin cá nhân
        </ThemedText>
      </TouchableScale>
    </GlassCard>
  );
};
