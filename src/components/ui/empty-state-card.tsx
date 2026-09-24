import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface EmptyStateCardProps {
  /** Main icon name from Ionicons or custom React Node */
  icon?: string | React.ReactNode;
  /** Size of icon. Defaults to 36 */
  iconSize?: number;
  /** Custom icon color. Defaults to theme textMuted */
  iconColor?: string;
  /** Primary title text */
  title: string;
  /** Optional secondary description text */
  description?: string;
  /** Optional button action label */
  actionLabel?: string;
  /** Press handler for action button */
  onAction?: () => void;
  /** Optional icon for action button */
  actionIcon?: string;
  /** Outer container style override */
  style?: StyleProp<ViewStyle>;
  /** Title text style override */
  titleStyle?: StyleProp<TextStyle>;
  /** Description text style override */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Inner GlassCard style override */
  cardStyle?: StyleProp<ViewStyle>;
}

export const EmptyStateCard = React.memo<EmptyStateCardProps>(({
  icon = 'document-text-outline',
  iconSize = 36,
  iconColor,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  style,
  titleStyle,
  descriptionStyle,
  cardStyle,
}) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const resolvedIconColor = iconColor || colors.textMuted;

  return (
    <View style={[styles.container, style]}>
      <GlassCard style={[styles.card, cardStyle]}>
        <View style={styles.iconWrapper}>
          {typeof icon === 'string' ? (
            <Ionicons name={icon as any} size={iconSize} color={resolvedIconColor} />
          ) : (
            icon
          )}
        </View>

        <ThemedText style={[styles.title, titleStyle]}>{title}</ThemedText>

        {description ? (
          <ThemedText style={[styles.description, { color: colors.textMuted }, descriptionStyle]}>
            {description}
          </ThemedText>
        ) : null}

        {actionLabel && onAction ? (
          <TouchableScale
            onPress={onAction}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            {actionIcon && <Ionicons name={actionIcon as any} size={18} color="#ffffff" style={styles.actionIcon} />}
            <ThemedText style={styles.actionText}>{actionLabel}</ThemedText>
          </TouchableScale>
        ) : null}
      </GlassCard>
    </View>
  );
});

EmptyStateCard.displayName = 'EmptyStateCard';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  iconWrapper: {
    marginBottom: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  actionIcon: {
    marginRight: Spacing.one,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
