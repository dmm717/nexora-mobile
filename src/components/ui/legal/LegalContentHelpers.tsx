import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export const renderBullet = (text: string, colors: any, styles: any) => (
  <View style={styles.bulletRow}>
    <View style={[styles.bulletDot, { backgroundColor: colors.textSecondary }]} />
    <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{text}</ThemedText>
  </View>
);

export const renderSectionHeader = (number: string, title: string, colors: any, styles: any) => (
  <View style={styles.sectionHeaderRow}>
    <View style={[styles.sectionNumberBadge, { backgroundColor: colors.primary + '15' }]}>
      <ThemedText style={[styles.sectionNumber, { color: colors.primary }]}>{number}</ThemedText>
    </View>
    <ThemedText style={styles.sectionHeading}>{title}</ThemedText>
  </View>
);
