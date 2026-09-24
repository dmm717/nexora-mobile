import React, { useState } from 'react';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExitConfirmationModal } from '@/components/interview/InterviewSubComponents';

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // State for exit confirmation modal when tapping bottom tabs from interview screen
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingTargetRoute, setPendingTargetRoute] = useState<string | null>(null);

  const handleStayInInterview = () => {
    setShowExitModal(false);
    setPendingTargetRoute(null);
  };

  const handleConfirmExitTab = () => {
    setShowExitModal(false);
    if (pendingTargetRoute) {
      router.push(pendingTargetRoute as any);
      setPendingTargetRoute(null);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Dynamic safe area calculations for Web & Mobile Go (iOS/Android home bar indicator)
  const isWeb = Platform.OS === 'web';
  const bottomPadding = isWeb ? 8 : Math.max(insets.bottom, 8);
  const calculatedHeight = isWeb ? 70 : 60 + insets.bottom;

  return (
    <>
      <Tabs
        screenListeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index];
            if (currentRoute?.name === 'interview') {
              if (currentRoute.key !== e.target) {
                e.preventDefault();
                const targetRoute = state.routes.find((r: any) => r.key === e.target);
                if (targetRoute?.name && targetRoute.name !== 'interview') {
                  setPendingTargetRoute(`/(tabs)/${targetRoute.name}`);
                  setShowExitModal(true);
                }
              }
            }
          },
        })}
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? 'rgba(19, 26, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            paddingTop: 4,
            paddingBottom: bottomPadding,
            height: calculatedHeight,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 1,
          },
          headerShown: false,
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="home"
          options={{
            title: 'Tổng quan',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            ),
          }}
        />

        {/* Tab 2: CV & JD */}
        <Tabs.Screen
          name="cv-jd"
          options={{
            title: 'CV & JD',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={20} color={color} />
            ),
          }}
        />

        {/* Tab 3: Phỏng vấn AI */}
        <Tabs.Screen
          name="interview"
          options={{
            title: 'Phỏng vấn',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'mic' : 'mic-outline'} size={20} color={color} />
            ),
          }}
        />

        {/* Tab 4: Luyện tập (Scenarios & STAR) */}
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Luyện tập',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'construct' : 'construct-outline'} size={20} color={color} />
            ),
          }}
        />

        {/* Tab 5: Growth & Progress */}
        <Tabs.Screen
          name="growth"
          options={{
            title: 'Tiến độ',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={20} color={color} />
            ),
          }}
        />

        {/* Tab 6: Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Hồ sơ',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Exit Confirmation Modal for Tab Bar Swaps */}
      <ExitConfirmationModal
        visible={showExitModal}
        colors={colors}
        onStay={handleStayInInterview}
        onLeave={handleConfirmExitTab}
      />
    </>
  );
}



