import React from 'react';
import { StyleSheet, FlatList, View, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { styles } from '@/styles/growth.styles';

const GrowthListItem = React.memo(({
  title,
  sub,
  iconName,
  iconColor,
  badgeBg,
  colors,
  onPress,
}: {
  title: string;
  sub: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badgeBg: string;
  colors: any;
  onPress: () => void;
}) => (
  <TouchableScale onPress={onPress}>
    <View style={styles.listItem}>
      <View style={[styles.listIconBadge, { backgroundColor: badgeBg }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.listTextContent}>
        <ThemedText style={styles.listTitle}>{title}</ThemedText>
        <ThemedText style={styles.listSub} numberOfLines={1}>{sub}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </View>
  </TouchableScale>
));

const GROWTH_LIST_DATA = [
  { id: 'readiness', type: 'readiness' as const },
  { id: 'roadmap', type: 'roadmap' as const },
];

export default function GrowthTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const renderItem = ({ item }: ListRenderItemInfo<typeof GROWTH_LIST_DATA[0]>) => {
    if (item.type === 'readiness') {
      return (
        <TouchableScale onPress={() => router.push('/(app)/growth/progress-dashboard' as any)}>
          <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="speedometer" size={20} color={colors.warning} />
              </View>
              <ThemedText style={styles.metricTitle}>Chỉ Số Sẵn Sàng (Readiness)</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevronIcon} />
            </View>
            
            <View style={styles.metricBody}>
              <View style={styles.metricScoreContainer}>
                <ThemedText style={[styles.metricNumber, { color: colors.warning }]}>--</ThemedText>
                <ThemedText style={styles.metricPercent}>%</ThemedText>
              </View>
              <View style={styles.metricInfo}>
                <ThemedText style={styles.metricStatus}>Chưa đủ dữ liệu</ThemedText>
                <ThemedText style={styles.metricSub}>Hoàn thành ít nhất 1 bài phỏng vấn để đánh giá</ThemedText>
              </View>
            </View>

            <View style={[styles.progressBarBg, { backgroundColor: colors.cardBorder }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.warning, width: '0%' }]} />
            </View>
          </GlassCard>
        </TouchableScale>
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Hồ sơ & Lộ trình</ThemedText>
        
        {/* Grouped List */}
        <GlassCard style={styles.listGroup}>
          <GrowthListItem
            title="Hồ Sơ Năng Lực (Skill Profile)"
            sub="Tổng hợp điểm mạnh & điểm yếu"
            iconName="ribbon"
            iconColor={colors.accent}
            badgeBg={colors.accentLight}
            colors={colors}
            onPress={() => router.push('/(app)/growth/skill-profile' as any)}
          />

          <View style={[styles.listDivider, { backgroundColor: colors.cardBorder }]} />

          <GrowthListItem
            title="Lộ Trình Học Tập AI"
            sub="Roadmap nhiệm vụ cá nhân hóa"
            iconName="map"
            iconColor={colors.primary}
            badgeBg={colors.primaryLight}
            colors={colors}
            onPress={() => router.push('/(app)/growth/learning-path' as any)}
          />
        </GlassCard>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.headerTitle}>Tiến Độ & Phát Triển</ThemedText>
      <ThemedText style={styles.headerSub}>Theo dõi năng lực và lộ trình cải thiện</ThemedText>
    </View>
  );

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={GROWTH_LIST_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}
