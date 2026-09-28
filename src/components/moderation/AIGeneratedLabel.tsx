import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';

export function AIGeneratedLabel() {
  const colors = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <Ionicons name="sparkles" size={12} color={colors.textMuted} />
      <ThemedText style={[styles.text, { color: colors.textMuted }]}>
        Nội dung do AI tạo
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    gap: Spacing.one,
  },
  text: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
  }
});