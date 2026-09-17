import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function PracticeTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Huấn Luyện AI</ThemedText>
          <ThemedText style={styles.headerSub}>Nâng cao kỹ năng phỏng vấn thực chiến</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Hero Card: Live Interview Room */}
          <TouchableScale onPress={() => router.push('/(app)/interview/preflight' as any)}>
            <GlassCard hasGlow glowColor={colors.glowPrimary} style={[styles.heroCard, { backgroundColor: colors.primary }]}>
              <View style={styles.heroContent}>
                <View style={styles.heroIconCircle}>
                  <Ionicons name="mic" size={32} color={colors.primary} />
                </View>
                <View style={styles.heroTextContainer}>
                  <ThemedText style={styles.heroTitle}>Phòng Phỏng Vấn Real-Time</ThemedText>
                  <ThemedText style={styles.heroSub}>
                    Mô phỏng phỏng vấn trực tiếp bằng giọng nói, bóc tách câu trả lời & nhận báo cáo ngay.
                  </ThemedText>
                </View>
                <View style={styles.heroActionRow}>
                  <ThemedText style={styles.heroActionText}>Bắt đầu ngay</ThemedText>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </View>
              </View>
            </GlassCard>
          </TouchableScale>

          {/* Section: Practice Tools (2-Column Grid) */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Công cụ rèn luyện chuyên sâu</ThemedText>
            
            <View style={styles.gridContainer}>
              {/* Card: Scenarios */}
              <TouchableScale 
                style={styles.gridItemWrapper} 
                onPress={() => router.push('/(app)/scenarios' as any)}
              >
                <GlassCard style={styles.gridCard}>
                  <View style={[styles.gridIconBadge, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="construct" size={24} color={colors.accent} />
                  </View>
                  <ThemedText style={styles.gridTitle}>Kịch Bản</ThemedText>
                  <ThemedText style={styles.gridSub} numberOfLines={2}>
                    Giải quyết tình huống thực tế
                  </ThemedText>
                </GlassCard>
              </TouchableScale>

              {/* Card: STAR Builder */}
              <TouchableScale 
                style={styles.gridItemWrapper}
                onPress={() => router.push('/(app)/star-builder' as any)}
              >
                <GlassCard style={styles.gridCard}>
                  <View style={[styles.gridIconBadge, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="star" size={24} color={colors.warning} />
                  </View>
                  <ThemedText style={styles.gridTitle}>Mô hình STAR</ThemedText>
                  <ThemedText style={styles.gridSub} numberOfLines={2}>
                    Chuẩn hóa câu trả lời
                  </ThemedText>
                </GlassCard>
              </TouchableScale>
            </View>
          </View>

          {/* Section: History */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Quản lý dữ liệu</ThemedText>
            <TouchableScale onPress={() => router.push('/(app)/interview/history' as any)}>
              <GlassCard style={styles.listCard}>
                <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="journal" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.listTitle}>Lịch Sử Phiên Phỏng Vấn</ThemedText>
                  <ThemedText style={styles.listSub}>Xem lại báo cáo đánh giá chi tiết</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </GlassCard>
            </TouchableScale>
          </View>

        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  heroCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  heroContent: {
    padding: Spacing.five,
    alignItems: 'flex-start',
    gap: Spacing.four,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTextContainer: {
    gap: Spacing.one,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  heroActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.9,
    paddingHorizontal: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  gridItemWrapper: {
    flex: 1,
  },
  gridCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    alignItems: 'flex-start',
    gap: Spacing.two,
    height: '100%',
  },
  gridIconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gridSub: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.three,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
