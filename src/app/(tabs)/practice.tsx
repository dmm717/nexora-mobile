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
import { styles } from './practice.styles';

export default function PracticeTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const listData = [
    {
      id: 'hero',
      type: 'hero',
    },
    {
      id: 'tools',
      type: 'tools',
    },
    {
      id: 'history',
      type: 'history',
    }
  ];

  const renderItem = ({ item }: ListRenderItemInfo<typeof listData[0]>) => {
    if (item.type === 'hero') {
      return (
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
      );
    }

    if (item.type === 'tools') {
      return (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Công cụ rèn luyện chuyên sâu</ThemedText>
          <View style={styles.gridContainer}>
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
      );
    }

    return (
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
    );
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Huấn Luyện AI</ThemedText>
          <ThemedText style={styles.headerSub}>Nâng cao kỹ năng phỏng vấn thực chiến</ThemedText>
        </View>

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}
