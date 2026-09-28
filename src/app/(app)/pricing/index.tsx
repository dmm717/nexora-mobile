import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIAP, PurchaseError, deepLinkToSubscriptions } from 'expo-iap';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pricingApi } from '@/api/pricing.api';
import { authApi } from '@/api/auth.api';
import { logger } from '@/services/logger';
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
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. Fetch Current User (with billing entitlement & orders)
  const {
    data: currentUser,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getMe(),
  });

  // 2. Fetch Pricing Plans from Backend
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    refetch: refetchPlans,
    isRefetching,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: pricingApi.listPlans,
  });

  // 3. Setup IAP
  const {
    connected,
    subscriptions,
    products,
    fetchProducts,
    requestPurchase,
    getAvailablePurchases,
    availablePurchases,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        setIsVerifying(true);
        // Step 2.4 & 2.3: POST /billing/google-play/verify -> backend cấp entitlement
        await pricingApi.verifyGooglePlayPurchase(
          purchase.productId,
          purchase.purchaseToken || '',
          purchase.id
        );
        // Step 2.4: BẮT BUỘC
        await finishTransaction({ purchase, isConsumable: false });
        Alert.alert('Thành Công', 'Nâng cấp gói dịch vụ thành công!');
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } catch (err: any) {
        Alert.alert('Chưa hoàn tất', 'Thanh toán thành công nhưng có lỗi khi xác nhận với Server. Vui lòng thử lại bằng cách "Khôi phục giao dịch".');
      } finally {
        setIsVerifying(false);
        setSelectedPriceId(null);
      }
    },
    onPurchaseError: (err: any) => {
      setIsVerifying(false);
      setSelectedPriceId(null);
      if (err?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể hoàn tất thanh toán qua Google Play.');
      }
    },
  });

  useEffect(() => {
    if (connected && plans.length > 0) {
      // Fetch products from store using backend plan codes as SKUs
      // Quy ước: productId trên store giống code của plan (e.g. nexora_pro_1m)
      const skus = plans.map(p => p.code.toLowerCase());
      fetchProducts({ skus, type: 'subs' }).catch(logger.error);
      fetchProducts({ skus, type: 'in-app' }).catch(logger.error);
      
      // Khôi phục giao dịch chưa xử lý khi khởi động
      getAvailablePurchases().catch(logger.error);
    }
  }, [connected, plans]);

  // Xử lý các giao dịch có sẵn (restore/pending)
  useEffect(() => {
    const processAvailablePurchases = async () => {
      if (!availablePurchases || availablePurchases.length === 0) return;
      
      for (const purchase of availablePurchases) {
        // Chỉ xử lý nếu chưa được verify hoặc app cần verify lại
        try {
          await pricingApi.verifyGooglePlayPurchase(
            purchase.productId,
            purchase.purchaseToken || '',
            purchase.id
          );
          await finishTransaction({ purchase, isConsumable: false });
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        } catch (e) {
          logger.error('Lỗi khi xử lý availablePurchase', e);
        }
      }
    };
    
    processAvailablePurchases();
  }, [availablePurchases]);

  const handleRefresh = async () => {
    await Promise.all([refetchUser(), refetchPlans()]);
  };

  const handleRestorePurchases = async () => {
    try {
      setIsVerifying(true);
      await getAvailablePurchases();
      Alert.alert('Thông báo', 'Đã yêu cầu kiểm tra lại các giao dịch đang treo.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể khôi phục giao dịch lúc này.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManageSubscriptions = async () => {
    try {
      if (currentPlanCode) {
        await deepLinkToSubscriptions({ skuAndroid: currentPlanCode, packageNameAndroid: 'com.nexora.app' });
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể mở trình quản lý gói cước Google Play.');
    }
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
        <AppScreenHeader title="Gói Dịch Vụ & Thanh Toán" fallbackRoute="/(tabs)/profile" />

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

            <ThemedText style={styles.mainHeading}>Gói dịch vụ & Lịch sử thanh toán</ThemedText>
            <ThemedText style={styles.subHeading}>
              Theo dõi hạn mức phỏng vấn, thời hạn gói và mở khóa thêm các tính năng phân tích & phỏng vấn AI mạnh mẽ.
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

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.four, gap: Spacing.three }}>
               <TouchableOpacity onPress={handleRestorePurchases}>
                 <ThemedText style={{ color: colors.textMuted, fontSize: 13, textDecorationLine: 'underline' }}>Khôi phục giao dịch</ThemedText>
               </TouchableOpacity>
               {currentPlanCode && currentPlanCode !== 'free' && (
                 <TouchableOpacity onPress={handleManageSubscriptions}>
                   <ThemedText style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Quản lý gia hạn (Google Play)</ThemedText>
                 </TouchableOpacity>
               )}
            </View>
          </GlassCard>

          {/* SECTION 2: NÂNG CẤP GÓI DỊCH VỤ */}
          <View style={[styles.sectionHeaderBlock, { borderBottomColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionTitle}>Nâng cấp gói dịch vụ</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Thanh toán an toàn qua Google Play. Giá cả được hiển thị trực tiếp từ kho ứng dụng.
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
                const priceMeta = plan.prices?.[0];
                if (!priceMeta) return null;

                const sku = plan.code.toLowerCase();
                const isCurrentPlan = currentPlanCode === sku;
                const isFree = priceMeta.amountMinor === 0;
                const isHighlighted = plan.isHighlighted;
                const featureDescriptions = priceMeta.features
                  .map(describePlanFeature)
                  .filter(Boolean) as string[];
                  
                // Match with store product if available
                const storeSub = subscriptions.find(s => s.id === sku);
                const storeProd = products.find(p => p.id === sku);
                const displayPrice = isFree ? 'Miễn phí' : (storeSub?.displayPrice || storeProd?.displayPrice || formatCurrency(priceMeta.amountMinor, priceMeta.currency));

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
                    {isHighlighted && (
                      <View style={styles.topBadgeContainer}>
                        <View style={[styles.topBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="sparkles" size={12} color="#f59e0b" />
                          <ThemedText style={styles.topBadgeText}>Phổ biến nhất</ThemedText>
                        </View>
                      </View>
                    )}

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

                    <View style={[styles.priceDisplayRow, { borderBottomColor: colors.cardBorder }]}>
                      <ThemedText style={styles.priceAmountText}>
                        {displayPrice}
                      </ThemedText>
                      {!isFree && priceMeta.durationDays > 0 && (
                        <ThemedText style={styles.priceDurationText}>
                          / {priceMeta.durationDays} ngày
                        </ThemedText>
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
                        isVerifying && selectedPriceId === sku && { opacity: 0.6 },
                      ]}
                      onPress={() => {
                        if (isCurrentPlan) return;
                        if (!isFree) {
                          setSelectedPriceId(sku);
                          requestPurchase({ request: { google: { skus: [sku] }, apple: { sku } }, type: storeSub ? 'subs' : 'in-app' }).catch(logger.error);
                        } else {
                          router.push('/(tabs)/home' as any);
                        }
                      }}
                      disabled={isCurrentPlan || isVerifying || (!storeSub && !storeProd && !isFree)}
                    >
                      {isVerifying && selectedPriceId === sku ? (
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
                            : (!storeSub && !storeProd && !isFree) 
                            ? 'Sản phẩm đang được cập nhật'
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
