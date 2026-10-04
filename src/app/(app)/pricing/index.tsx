import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pricingApi } from '@/api/pricing.api';
import { authApi } from '@/api/auth.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import {
  formatCurrency,
  getExactEntitlementFeature,
  formatFeatureAvailability,
  formatInterviewQuestionLimit,
  describePlanFeature,
} from '@/utils/billing-presentation';
import { styles } from '@/styles/pricing.styles';

export default function PricingScreen() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];


  // 1. Fetch Current User (with billing entitlement & orders)
  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getMe(),
  });

  // 2. Fetch Pricing Plans from Backend
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError: isPlansError,
    refetch: refetchPlans,
    isRefetching,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: pricingApi.listPlans,
  });

  // (Removed IAP logic for policy compliance)

  const handleRefresh = async () => {
    await Promise.all([refetchUser(), refetchPlans()]);
  };

  // Billing Entitlement Calculations
  const entitlement = currentUser?.billing?.entitlement;
  const orders = currentUser?.billing?.orders || [];
  const currentPlanCode = entitlement?.planCode ? entitlement.planCode.toLowerCase() : null;
  const planNameDisplay = entitlement?.planCode
    ? entitlement.planCode.toUpperCase()
    : 'Chưa có thông tin gói';

  const expiresAtText = entitlement?.endsAt
    ? new Date(entitlement.endsAt).toLocaleDateString('vi-VN')
    : entitlement
    ? 'Không có ngày hết hạn'
    : 'Chưa có thông tin';

  const interviewFeature = getExactEntitlementFeature(entitlement?.features, 'interview');
  const cvFeature = getExactEntitlementFeature(entitlement?.features, 'cv_analysis');
  const questionLimitFeature = getExactEntitlementFeature(
    entitlement?.features,
    'interview_question_limit'
  );

  const interviewQuotaText = formatFeatureAvailability(interviewFeature, 'phiên');
  const cvAnalysisText = formatFeatureAvailability(cvFeature, 'lần');
  const interviewQuestionLimitText = formatInterviewQuestionLimit(questionLimitFeature);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader title="Quyền Lợi Tài Khoản" fallbackRoute="/(tabs)/profile" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {/* PAGE HERO HEADER BLOCK */}
          <View style={styles.heroBlock}>
            <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="card-outline" size={14} color={colors.primary} />
              <ThemedText style={[styles.pillBadgeText, { color: colors.primary }]}>
                Quản lý tài khoản & Gói dịch vụ
              </ThemedText>
            </View>

            <ThemedText style={styles.mainHeading}>Quyền lợi & Lịch sử giao dịch</ThemedText>
            <ThemedText style={styles.subHeading}>
              Theo dõi quyền lợi hiện có, lượt sử dụng và thời hạn do máy chủ Nexora cung cấp. Ứng dụng không xử lý mua hàng.
            </ThemedText>
          </View>

          {/* CARD 1: GÓI HIỆN TẠI */}
          <GlassCard style={styles.entitlementCard}>
            <View style={[styles.entitlementHeaderRow, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <ThemedText style={[styles.entitlementHeaderLabel, { color: colors.textMuted }]}>
                  GÓI HIỆN TẠI
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <ThemedText style={[styles.planCodeText, { color: colors.primary }]}>
                    {planNameDisplay}
                  </ThemedText>
                  <View style={[styles.activeStatusBadge, { backgroundColor: colors.primaryLight }]}>
                    <ThemedText style={[styles.activeStatusBadgeText, { color: colors.primary }]}>
                      {isUserLoading ? 'Đang tải' : isUserError ? 'Không thể tải' : entitlement ? 'Đã nhận quyền lợi' : 'Chưa có thông tin'}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View>
                <ThemedText style={styles.expiryLabel}>Thời hạn sử dụng</ThemedText>
                <ThemedText style={styles.expiryValue}>{expiresAtText}</ThemedText>
              </View>
            </View>

            <View style={styles.quotaGrid}>
              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Hạn mức phỏng vấn khả dụng</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{interviewQuotaText}</ThemedText>
                {interviewFeature && <ThemedText>Đã dùng: {interviewFeature.consumed}</ThemedText>}
              </View>

              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Phân tích CV & So khớp JD</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{cvAnalysisText}</ThemedText>
                {cvFeature && <ThemedText>Đã dùng: {cvFeature.consumed}</ThemedText>}
              </View>

              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Giới hạn câu hỏi / phiên</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{interviewQuestionLimitText}</ThemedText>
              </View>
            </View>
          </GlassCard>

          {/* SECTION 2: GÓI DỊCH VỤ */}
          <View style={[styles.sectionHeaderBlock, { borderBottomColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionTitle}>Chi tiết gói hiện tại</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Hạn mức danh nghĩa của gói hiện tại. Quyền lợi thực tế và lượt còn lại được hiển thị ở trên.
            </ThemedText>
          </View>

          {isPlansLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : isPlansError || !plans.some((plan) => plan.code.toLowerCase() === currentPlanCode) ? (
            <GlassCard style={{ alignItems: 'center', padding: Spacing.four }}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.textMuted} />
              <ThemedText style={{ marginTop: Spacing.one, opacity: 0.8 }}>
                {isPlansError ? 'Không thể tải chi tiết gói. Vui lòng thử lại.' : 'Chưa có chi tiết gói hiện tại.'}
              </ThemedText>
            </GlassCard>
          ) : (
            <View style={styles.plansStack}>
              {plans.filter((plan) => plan.code.toLowerCase() === currentPlanCode).map((plan) => {
                const priceMeta = plan.prices?.[0];
                if (!priceMeta) return null;

                const sku = plan.code.toLowerCase();
                const isCurrentPlan = currentPlanCode === sku;

                const featureDescriptions = priceMeta.features
                  .map(describePlanFeature)
                  .filter(Boolean) as string[];



                return (
                  <View
                    key={plan.id}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: isCurrentPlan
                          ? colors.primaryLight + '20'
                          : colors.surface,
                        borderColor: isCurrentPlan
                          ? colors.primary
                          : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.planHeaderRow}>
                      <ThemedText style={styles.planNameText}>{plan.name}</ThemedText>
                      {isCurrentPlan && (
                        <View style={[styles.currentPlanBadge, { backgroundColor: colors.primaryLight }]}>
                          <ThemedText style={[styles.currentPlanBadgeText, { color: colors.primary }]}>
                            Gói hiện tại
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    <View style={styles.featuresContainer}>
                      {priceMeta.interviewQuota > 0 && (
                        <View style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <ThemedText style={styles.featureText}>
                            Hạn mức phỏng vấn: {priceMeta.interviewQuota} lượt
                          </ThemedText>
                        </View>
                      )}
                      {featureDescriptions.map((desc, fIdx) => (
                        <View key={fIdx} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <ThemedText style={styles.featureText}>{desc}</ThemedText>
                        </View>
                      ))}
                    </View>

                    {isCurrentPlan && (
                      <View
                        style={[
                          styles.planActionButton,
                          {
                            backgroundColor: colors.cardBorder,
                            borderWidth: 0,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.planActionText,
                            { color: colors.textMuted },
                          ]}
                        >
                          Gói hiện tại
                        </ThemedText>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* SECTION 3: LỊCH SỬ GIAO DỊCH */}
          {orders.length > 0 && (
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <View style={[styles.sectionHeaderBlock, { borderBottomColor: colors.cardBorder }]}>
                <ThemedText style={styles.sectionTitle}>Lịch sử giao dịch</ThemedText>
              </View>

              <View style={styles.ordersContainer}>
                {orders.map((o) => {
                  return (
                    <View
                      key={o.id}
                      style={[
                        styles.orderItemCard,
                        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                      ]}
                    >
                      <View style={styles.orderHeaderRow}>
                        <ThemedText style={[styles.orderCodeText, { color: colors.primary }]}>
                          {o.id.slice(0, 12)}
                        </ThemedText>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </View>

                      <View style={styles.orderMetaRow}>
                        <View style={{ gap: 2 }}>
                          <ThemedText style={styles.orderPlanCode}>{o.planCode}</ThemedText>
                          <ThemedText style={styles.orderDateText}>
                            {new Date(o.createdAt).toLocaleString('vi-VN')}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.orderAmountText}>
                          {formatCurrency(o.amountMinor, o.currency)}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="profile" />
      </SafeAreaView>
    </ThemedView>
  );
}

