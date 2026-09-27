import React, { memo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from '@/styles/interview-preflight.styles';
import { Spacing, Colors } from '@/constants/theme';
import { TouchableScale } from '@/components/ui/touchable-scale';

export const PreflightHeroBanner = memo(({ colors }: { colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary, padding: Spacing.four }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: Spacing.two }}>
        <ThemedText style={{ color: '#ffffff', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 }}>
          Chuẩn bị vào phòng phỏng vấn Nexora AI
        </ThemedText>
        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, lineHeight: 17, marginTop: 6 }}>
          Chọn bối cảnh cho phiên này, cấu hình độ khó và kiểm tra microphone trước khi bắt đầu. Các thay đổi chỉ áp dụng cho phiên hiện tại.
        </ThemedText>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="hardware-chip-outline" size={24} color="#ffffff" />
      </View>
    </View>
  </View>
));
