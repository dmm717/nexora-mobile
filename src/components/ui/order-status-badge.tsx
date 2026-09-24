import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getOrderStatusPresentation } from '@/utils/billing-presentation';
import { Radius } from '@/constants/theme';

export interface OrderStatusBadgeProps {
  /** Raw status code (e.g. 'Pending', 'Completed', 'Failed', 'Cancelled') */
  status?: string | null;
  /** Optional override for status label */
  label?: string;
  /** Container style override */
  style?: StyleProp<ViewStyle>;
  /** Text style override */
  textStyle?: StyleProp<TextStyle>;
  /** Badge size preset. Defaults to 'md' */
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge = React.memo<OrderStatusBadgeProps>(({
  status,
  label,
  style,
  textStyle,
  size = 'md',
}) => {
  const statusInfo = getOrderStatusPresentation(status);
  const displayLabel = label || statusInfo.label;

  const sizeConfig = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
    lg: { paddingHorizontal: 10, paddingVertical: 5, fontSize: 12 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusInfo.bgColor },
        { paddingHorizontal: sizeConfig.paddingHorizontal, paddingVertical: sizeConfig.paddingVertical },
        style,
      ]}
    >
      <ThemedText
        style={[
          styles.badgeText,
          { color: statusInfo.color, fontSize: sizeConfig.fontSize },
          textStyle,
        ]}
      >
        {displayLabel}
      </ThemedText>
    </View>
  );
});

OrderStatusBadge.displayName = 'OrderStatusBadge';

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
