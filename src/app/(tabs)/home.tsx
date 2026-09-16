import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Auth State Header Banner */}
        <ThemedView type="backgroundElement" style={styles.authBanner}>
          <View style={styles.userInfo}>
            <View style={styles.userTextContainer}>
              <ThemedText style={styles.welcomeText}>Xin chào,</ThemedText>
              <ThemedText type="subtitle" style={styles.userName}>
                {user?.fullName || user?.email}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            </View>
            <Pressable style={styles.logoutButton} onPress={logout}>
              <ThemedText style={styles.logoutText}>Đăng Xuất</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <ThemedView style={styles.heroSection}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <ThemedText type="title" style={styles.title}>
            Nexora AI Interview
          </ThemedText>
          <ThemedText style={styles.description}>
            Nền tảng phỏng vấn và huấn luyện kỹ năng sự nghiệp thông minh
          </ThemedText>
        </ThemedView>

        {WebBadge && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.two,
  },
  authBanner: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    opacity: 0.7,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    opacity: 0.6,
  },
  logoutButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: '#FF3B30',
    borderRadius: Spacing.two,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.two,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 15,
  },
});
