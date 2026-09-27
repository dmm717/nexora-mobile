import React, { memo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from '@/styles/interview-preflight.styles';
import { Spacing, Colors } from '@/constants/theme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { INTERVIEW_TYPES } from './constants';

export const PreflightTypeCard = memo(({
  interviewType,
  setInterviewType,
  colors,
}: {
  interviewType: string;
  setInterviewType: (t: string) => void;
  colors: any;
}) => {
  const currentIndex = INTERVIEW_TYPES.findIndex((t) => t.id === interviewType);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const selectedType = INTERVIEW_TYPES[safeIndex];

  const handlePrev = () => {
    const prevIndex = (safeIndex - 1 + INTERVIEW_TYPES.length) % INTERVIEW_TYPES.length;
    setInterviewType(INTERVIEW_TYPES[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (safeIndex + 1) % INTERVIEW_TYPES.length;
    setInterviewType(INTERVIEW_TYPES[nextIndex].id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, gap: Spacing.three }]}>
      {/* Header Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="layers-outline" size={22} color={colors.secondary} />
          <ThemedText type="subtitle" style={styles.cardTitle}>Chủ Đề Phỏng Vấn Trọng Tâm</ThemedText>
        </View>
        <View style={{ backgroundColor: colors.backgroundElement, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
          <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
            {safeIndex + 1} / {INTERVIEW_TYPES.length}
          </ThemedText>
        </View>
      </View>

      {/* Horizontal Scrollable Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {INTERVIEW_TYPES.map((type) => {
          const isSelected = interviewType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.cardBorder,
                backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
              }}
              onPress={() => setInterviewType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={15}
                color={isSelected ? '#ffffff' : colors.textSecondary}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#ffffff' : colors.text,
                }}
              >
                {type.shortLabel}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Ultra-Premium Glassmorphic Spotlight Card */}
      <View
        style={{
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 14,
          gap: 10,
        }}
      >
        {/* Top Header inside card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={selectedType.icon as any} size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemedText style={{ fontSize: 15, fontWeight: '800', color: colors.primary }} numberOfLines={1}>
                {selectedType.label}
              </ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textMuted }}>
                Chủ đề phỏng vấn #{safeIndex + 1}
              </ThemedText>
            </View>
          </View>
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <ThemedText style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>✓ Đã chọn</ThemedText>
          </View>
        </View>

        {/* Description */}
        <ThemedText style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 }}>
          {selectedType.desc}
        </ThemedText>

        {/* Focus Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {selectedType.tags.map((tag, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <ThemedText style={{ fontSize: 10.5, fontWeight: '600', color: colors.primary }}>
                🏷️ {tag}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Quick Prev / Next Navigator Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            onPress={handlePrev}
          >
            <Ionicons name="chevron-back" size={16} color={colors.primary} />
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Chủ đề trước</ThemedText>
          </TouchableOpacity>

          {/* Dots */}
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            {INTERVIEW_TYPES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === safeIndex ? 14 : 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: i === safeIndex ? colors.primary : colors.cardBorder,
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            onPress={handleNext}
          >
            <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Chủ đề sau</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
