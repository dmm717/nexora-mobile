import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TabId = 'home' | 'cv-jd' | 'interview' | 'practice' | 'growth' | 'profile';

interface AppBottomNavBarProps {
  activeTab?: TabId | 'none';
}

export function AppBottomNavBar({ activeTab = 'none' }: AppBottomNavBarProps) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // If the current screen is rendered inside the (tabs) layout,
  // Expo Router's native Tabs navigator ALREADY renders the bottom tab bar.
  // Hide this standalone nav bar to prevent duplicate bottom navigation bars.
  const isInsideTabs =
    (segments as string[]).includes('(tabs)') || (typeof pathname === 'string' && pathname.startsWith('/(tabs)'));

  if (isInsideTabs) {
    return null;
  }

  const isWeb = Platform.OS === 'web';
  const bottomPadding = isWeb ? 8 : Math.max(insets.bottom, 8);
  const calculatedHeight = isWeb ? 70 : 60 + insets.bottom;

  const tabs: Array<{
    id: TabId;
    title: string;
    route: string;
    iconOutline: keyof typeof Ionicons.glyphMap;
    iconFilled: keyof typeof Ionicons.glyphMap;
  }> = [
    { id: 'home', title: 'Tổng quan', route: '/(tabs)/home', iconOutline: 'home-outline', iconFilled: 'home' },
    { id: 'cv-jd', title: 'CV & JD', route: '/(tabs)/cv-jd', iconOutline: 'document-text-outline', iconFilled: 'document-text' },
    { id: 'interview', title: 'Phỏng vấn', route: '/(tabs)/interview', iconOutline: 'mic-outline', iconFilled: 'mic' },
    { id: 'practice', title: 'Luyện tập', route: '/(tabs)/practice', iconOutline: 'construct-outline', iconFilled: 'construct' },
    { id: 'growth', title: 'Tiến độ', route: '/(tabs)/growth', iconOutline: 'analytics-outline', iconFilled: 'analytics' },
    { id: 'profile', title: 'Hồ sơ', route: '/(tabs)/profile', iconOutline: 'person-outline', iconFilled: 'person' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colorScheme === 'dark' ? 'rgba(19, 26, 41, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        paddingTop: 4,
        paddingBottom: bottomPadding,
        height: calculatedHeight,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconName = isActive ? tab.iconFilled : tab.iconOutline;
        const iconColor = isActive ? colors.primary : colors.textMuted;
        const textColor = isActive ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.id}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => router.replace(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={20} color={iconColor} />
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: isActive ? '700' : '600',
                color: textColor,
                marginTop: 1,
              }}
            >
              {tab.title}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
