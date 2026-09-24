import React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { safeBack } from '@/utils/navigation';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AppScreenHeaderProps {
  /** Title displayed in header */
  title?: string;
  /** Subtitle text below title */
  subtitle?: string;
  /** Custom back button press handler. Defaults to safeBack(router, fallbackRoute) */
  onBack?: () => void;
  /** Fallback route path if back navigation stack is empty */
  fallbackRoute?: string;
  /** Whether to show the back button. Defaults to true */
  showBack?: boolean;
  /** Right side element (e.g. icon buttons, badges, action links) */
  rightElement?: React.ReactNode;
  /** Custom style override for the top header container */
  style?: StyleProp<ViewStyle>;
  /** Custom style override for the title text */
  titleStyle?: StyleProp<TextStyle>;
  /** Whether to render a bottom border line. Defaults to true */
  borderBottom?: boolean;
}

/** Standardized uniform height for all screen headers across the mobile app */
export const HEADER_HEIGHT = 56;

export const AppScreenHeader = React.memo<AppScreenHeaderProps>(({
  title,
  subtitle,
  onBack,
  fallbackRoute,
  showBack = true,
  rightElement,
  style,
  titleStyle,
  borderBottom = true,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      safeBack(router, fallbackRoute);
    }
  };

  return (
    <View
      style={[
        styles.headerNav,
        borderBottom && { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 },
        style,
      ]}
    >
      {showBack ? (
        <TouchableScale onPress={handleBack} style={styles.backButton} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableScale>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <View style={styles.titleContainer}>
        {title ? (
          <ThemedText style={[styles.headerNavTitle, titleStyle]} numberOfLines={1}>
            {title}
          </ThemedText>
        ) : null}
        {subtitle ? (
          <ThemedText style={[styles.headerNavSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {rightElement || null}
      </View>
    </View>
  );
});

AppScreenHeader.displayName = 'AppScreenHeader';

const styles = StyleSheet.create({
  headerNav: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: Spacing.one,
  },
  backButtonPlaceholder: {
    width: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerNavTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerNavSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
});
