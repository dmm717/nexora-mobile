import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userApi } from '@/api/user.api';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { ProductFeedbackCard } from '@/components/profile/ProductFeedbackCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LegalPolicyModal, PolicyTab } from '@/components/ui/legal-policy-modal';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/account.styles';

import { PersonalInformationCard } from '@/components/account/PersonalInformationCard';
import { SecurityCard } from '@/components/account/SecurityCard';
import { PlanUsageCard } from '@/components/account/PlanUsageCard';
import { PrivacyDataCard } from '@/components/account/PrivacyDataCard';
import { SessionsCard } from '@/components/account/SessionsCard';
import { LegalComplianceCard } from '@/components/account/LegalComplianceCard';
import { DangerZoneCard } from '@/components/account/DangerZoneCard';

export default function AccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openLegal?: string; tab?: string }>();
  const { user: authUser, logout } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [isLegalModalVisible, setIsLegalModalVisible] = useState(params.openLegal === 'true');
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>((params.tab as PolicyTab) || 'privacy');

  useEffect(() => {
    if (params.openLegal === 'true') {
      setIsLegalModalVisible(true);
      if (params.tab) {
        setLegalModalTab(params.tab as PolicyTab);
      }
    }
  }, [params.openLegal, params.tab]);

  const openLegalModal = (tab: PolicyTab) => {
    setLegalModalTab(tab);
    setIsLegalModalVisible(true);
  };

  const {
    data: user,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser,
    enabled: !!authUser,
  });

  const currentUserData = user || authUser;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader title="Cài Đặt Tài Khoản" fallbackRoute="/(tabs)/profile" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
        >
          <View style={styles.heroBlock}>
            <ThemedText style={[styles.topLabelText, { color: colors.primary }]}>
              TÀI KHOẢN & BẢO MẬT
            </ThemedText>
            <ThemedText style={styles.mainHeading}>Cài đặt tài khoản</ThemedText>
            <ThemedText style={styles.subHeading}>
              Quản lý thông tin cá nhân, bảo mật, gói sử dụng và quyền riêng tư.
            </ThemedText>
            <TouchableScale
              style={styles.linkBtn}
              onPress={() => router.push('/(app)/career-profile' as any)}
            >
              <ThemedText style={[styles.linkBtnText, { color: colors.primary }]}>
                → Quản lý CV & Mục tiêu nghề nghiệp trong Hồ sơ nghề nghiệp
              </ThemedText>
            </TouchableScale>
          </View>

          <PersonalInformationCard currentUserData={currentUserData} colors={colors} />
          <SecurityCard colors={colors} />
          <PlanUsageCard currentUserData={currentUserData} colors={colors} />
          <PrivacyDataCard currentUserData={currentUserData} colors={colors} />
          <ProductFeedbackCard />
          <SessionsCard logout={logout} colors={colors} />
          <LegalComplianceCard openLegalModal={openLegalModal} colors={colors} />
          <DangerZoneCard logout={logout} />

        </ScrollView>
        <AppBottomNavBar activeTab="profile" />

        <LegalPolicyModal
          visible={isLegalModalVisible}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalVisible(false)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
