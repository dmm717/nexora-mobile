import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pricingApi } from '@/api/pricing.api';
import { authApi } from '@/api/auth.api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import { safeBack } from '@/utils/navigation';
import {
  formatCurrency,
  getExactEntitlementFeature,
  formatFeatureAvailability,
  formatInterviewQuestionLimit,
  describePlanFeature,
  getOrderStatusPresentation,
} from '@/utils/billing-presentation';
import { styles } from '@/styles/pricing.styles';

export default function PricingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  // 1. Fetch Current User (with billing entitlement & orders)
  const {
    data: currentUser,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getMe(),
  });

  // 2. Fetch Pricing Plans
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    refetch: refetchPlans,
    isRefetching,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: pricingApi.listPlans,
  });

  const isRefreshing = isRefetching;
  const handleRefresh = async () => {
    await Promise.all([refetchUser(), refetchPlans()]);
  };

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) => pricingApi.createCheckoutSession(priceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      if (data.checkout?.url) {
        Alert.alert(
          'Đơn Hàng Đã Tạo',
          `Mã đơn hàng: ${data.orderId.slice(0, 12)}\nSố tiền: ${formatCurrency(
            data.amountMinor,
            data.currency
          )}\n\nBạn có muốn mở trang thanh toán an toàn ngay không?`,
          [
            { text: 'Để sau', style: 'cancel' },
            {
              text: 'Thanh toán ngay',
              onPress: () => {
                if (data.checkout?.url) {
                  Linking.openURL(data.checkout.url);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Thành Công', `Đã khởi tạo đơn hàng: ${data.orderId.slice(0, 12)}`);
      }
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo đơn hàng thanh toán.');
    },
  });

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
        {/* Navigation Header */}
        <AppScreenHeader title="Gói Dịch Vụ & Thanh Toán" fallbackRoute="/(tabs)/profile" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {/* PAGE HERO HEADER BLOCK (BillingPageHeader) */}
          <View style={styles.heroBlock}>
            <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="card-outline" size={14} color={colors.primary} />
              <ThemedText style={[styles.pillBadgeText, { color: colors.primary }]}>
                Quản lý tài khoản & Gói dịch vụ
              </ThemedText>
            </View>

            <ThemedText style={styles.mainHeading}>Gói dịch vụ & Lịch sử thanh toán</ThemedText>

            <ThemedText style={styles.subHeading}>
              Theo dõi hạn mức phỏng vấn, thời hạn gói và mở khóa thêm các tính năng phân tích & phỏng vấn AI mạnh mẽ.
            </ThemedText>
          </View>

          {/* CARD 1: GÓI HIỆN TẠI (Current Entitlement Card) */}
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
                      Đang hoạt động
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View>
                <ThemedText style={styles.expiryLabel}>Thời hạn sử dụng</ThemedText>
                <ThemedText style={styles.expiryValue}>{expiresAtText}</ThemedText>
              </View>
            </View>

            {/* 3 Quota Highlights Boxes */}
            <View style={styles.quotaGrid}>
              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Hạn mức phỏng vấn khả dụng</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{interviewQuotaText}</ThemedText>
              </View>

              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Phân tích CV & So khớp JD</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{cvAnalysisText}</ThemedText>
              </View>

              <View style={[styles.quotaBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.quotaBoxLabel}>Giới hạn câu hỏi / phiên</ThemedText>
                <ThemedText style={styles.quotaBoxValue}>{interviewQuestionLimitText}</ThemedText>
              </View>
            </View>
          </GlassCard>

          {/* SECTION 2: NÂNG CẤP GÓI DỊCH VỤ (Upgrade Plans Section) */}
          <View style={[styles.sectionHeaderBlock, { borderBottomColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionTitle}>Nâng cấp gói dịch vụ</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Chọn gói cước phù hợp với tốc độ luyện tập và mục tiêu chuẩn bị phỏng vấn của bạn.
            </ThemedText>
          </View>

          {isPlansLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : plans.length === 0 ? (
            <GlassCard style={{ alignItems: 'center', padding: Spacing.four }}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.textMuted} />
              <ThemedText style={{ marginTop: Spacing.one, opacity: 0.8 }}>
                Hiện chưa có gói dịch vụ khả dụng.
              </ThemedText>
            </GlassCard>
          ) : (
            <View style={styles.plansStack}>
              {plans.map((plan) => {
                const price = plan.prices?.[0];
                if (!price) return null;

                const isCurrentPlan = currentPlanCode === plan.code.toLowerCase();
                const isFree = price.amountMinor === 0;
                const isHighlighted = plan.isHighlighted;
                const featureDescriptions = price.features
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
                          : isHighlighted
                          ? colors.primary
                          : colors.cardBorder,
                      },
                      isHighlighted && styles.highlightedPlanCard,
                    ]}
                  >
                    {/* Highlight Badge on top center */}
                    {isHighlighted && (
                      <View style={styles.topBadgeContainer}>
                        <View style={[styles.topBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="sparkles" size={12} color="#f59e0b" />
                          <ThemedText style={styles.topBadgeText}>Phổ biến nhất</ThemedText>
                        </View>
                      </View>
                    )}

                    {/* Plan Header */}
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

                    <ThemedText style={styles.planDescText}>
                      {plan.description ||
                        'Gói dịch vụ được thiết kế tối ưu cho nhu cầu rèn luyện phỏng vấn của bạn.'}
                    </ThemedText>

                    {/* Price Display */}
                    <View style={[styles.priceDisplayRow, { borderBottomColor: colors.cardBorder }]}>
                      <ThemedText style={styles.priceAmountText}>
                        {isFree ? 'Miễn phí' : formatCurrency(price.amountMinor, price.currency)}
                      </ThemedText>
                      {!isFree && price.durationDays > 0 && (
                        <ThemedText style={styles.priceDurationText}>
                          / {price.durationDays} ngày
                        </ThemedText>
                      )}
                    </View>

                    {/* Features Checklist */}
                    <View style={styles.featuresContainer}>
                      {price.interviewQuota > 0 && (
                        <View style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <ThemedText style={styles.featureText}>
                            Hạn mức phỏng vấn: {price.interviewQuota} lượt
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

                    {/* Bottom Action Button */}
                    <TouchableOpacity
                      style={[
                        styles.planActionButton,
                        {
                          backgroundColor: isCurrentPlan
                            ? colors.cardBorder
                            : isHighlighted
                            ? colors.primary
                            : 'transparent',
                          borderWidth: isCurrentPlan || isHighlighted ? 0 : 1,
                          borderColor: colors.primary,
                        },
                        checkoutMutation.isPending && selectedPriceId === price.id && { opacity: 0.6 },
                      ]}
                      onPress={() => {
                        if (isCurrentPlan) return;
                        if (!isFree) {
                          setSelectedPriceId(price.id);
                          checkoutMutation.mutate(price.id);
                        } else {
                          router.push('/(tabs)/home' as any);
                        }
                      }}
                      disabled={isCurrentPlan || (checkoutMutation.isPending && selectedPriceId === price.id)}
                    >
                      {checkoutMutation.isPending && selectedPriceId === price.id ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <ThemedText
                          style={[
                            styles.planActionText,
                            {
                              color: isCurrentPlan
                                ? colors.textMuted
                                : isHighlighted
                                ? '#ffffff'
                                : colors.primary,
                            },
                          ]}
                        >
                          {isCurrentPlan
                            ? 'Gói hiện tại'
                            : isHighlighted
                            ? 'Nâng cấp ngay'
                            : 'Chọn gói này'}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* SECTION 3: LỊCH SỬ GIAO DỊCH (Orders History) */}
          {orders.length > 0 && (
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <View style={[styles.sectionHeaderBlock, { borderBottomColor: colors.cardBorder }]}>
                <ThemedText style={styles.sectionTitle}>Lịch sử giao dịch</ThemedText>
              </View>

              <View style={styles.ordersContainer}>
                {orders.map((o) => {
                  const statusInfo = getOrderStatusPresentation(o.status);
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
