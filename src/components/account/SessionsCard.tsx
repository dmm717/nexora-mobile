import React from 'react';
import { View, Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/account.styles';

export const SessionsCard = ({ logout, colors }: { logout: () => void; colors: any }) => {
  return (
    <GlassCard style={styles.card}>
      <View>
        <ThemedText style={styles.cardTitle}>Phiên đăng nhập</ThemedText>
        <ThemedText style={styles.cardSubtitle}>
          Quản lý phiên làm việc hiện tại hoặc kết thúc tất cả phiên đăng nhập khác.
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', marginTop: 4 }}>
        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
          onPress={logout}
        >
          <ThemedText style={[styles.btnText, { color: colors.text }]}>
            Đăng xuất thiết bị này
          </ThemedText>
        </TouchableScale>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
          onPress={() =>
            Alert.alert(
              'Đăng Xuất Tất Cả Thiết Bị',
              'Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị không?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất tất cả', style: 'destructive', onPress: logout },
              ]
            )
          }
        >
          <ThemedText style={[styles.btnText, { color: colors.primary }]}>
            Đăng xuất khỏi tất cả thiết bị
          </ThemedText>
        </TouchableScale>
      </View>
    </GlassCard>
  );
};
