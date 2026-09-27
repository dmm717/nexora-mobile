import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Radius } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';

export const ActionPlanSection = React.memo(({
  report,
  colors,
}: {
  report: any;
  colors: any;
}) => {
  if (!report.actionPlan || !Array.isArray(report.actionPlan) || report.actionPlan.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        <Ionicons name="flag-outline" size={20} color={colors.primary} />
        <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: '700' }}>Kế Hoạch Hành Động Đề Xuất (Action Plan)</ThemedText>
      </View>

      <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
        {report.actionPlan.map((step: string, idx: number) => (
          <View key={`step-${idx}-${step.substring(0, 10)}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, backgroundColor: colors.backgroundElement, padding: Spacing.two, borderRadius: Radius.md }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{idx + 1}</ThemedText>
            </View>
            <ThemedText style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>{step}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
});
