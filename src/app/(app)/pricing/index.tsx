import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pricingApi } from '@/api/pricing.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PricingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const { data: plans, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['plans'],
    queryFn: pricingApi.listPlans,
  });

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) => pricingApi.createCheckoutSession(priceId),
    onSuccess: (data) => {
      if (data.checkout?.url) {
        Alert.alert(
          'Đơn Hàng Đã Tạo',
          `Mã đơn hàng: ${data.orderId}\nSố tiền: ${data.amountMinor.toLocaleString('vi-VN')} ${data.currency}\n\nĐang mở trang thanh toán an toàn...`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Thành Công', `Đã khởi tạo đơn hàng: ${data.orderId}`);
      }
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo đơn hàng thanh toán.');
    },
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Bảng Gói Cước & Quyền Hạn</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Store Compliance Banner */}
          <View style={[styles.warningBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.warningTitle, { color: colors.warning }]}>
                🔒 Tuân Thủ Chính Sách Store (Apple IAP & Google Billing)
              </ThemedText>
              <ThemedText style={styles.warningSub}>
                Quyền hạn tính năng (Entitlements) được backend xác thực authoritative. Các tính năng số được bảo vệ theo đúng chuẩn Store Guidelines.
              </ThemedText>
            </View>
          </View>

          {isLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : isError || !plans || plans.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>Chưa thể tải danh sách gói cước.</ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.four }}>
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    plan.isHighlighted && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ThemedText type="subtitle" style={styles.planName}>{plan.name}</ThemedText>
                        {plan.badge && (
                          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{plan.badge}</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.planDesc}>{plan.description}</ThemedText>
                    </View>
                  </View>

                  {/* Prices list */}
                  {plan.prices.map((price) => (
                    <View key={price.id} style={[styles.priceBox, { backgroundColor: colors.backgroundElement }]}>
                      <View style={styles.priceHeaderRow}>
                        <ThemedText style={styles.amountText}>
                          {price.amountMinor === 0 ? 'Miễn phí' : `${price.amountMinor.toLocaleString('vi-VN')} ${price.currency}`}
                        </ThemedText>
                        <ThemedText style={styles.durationText}>
                          {price.durationDays > 0 ? `/ ${price.durationDays} ngày` : 'Vĩnh viễn'}
                        </ThemedText>
                      </View>

                      <ThemedText style={styles.quotaText}>
                        Lượt phỏng vấn: {price.interviewQuota > 0 ? `${price.interviewQuota} lượt` : 'Không giới hạn'}
                      </ThemedText>

                      {/* Features Checklist */}
                      <View style={styles.featuresList}>
                        {price.features.map((feat, fIdx) => (
                          <View key={fIdx} style={styles.featureRow}>
                            <Ionicons
                              name={feat.enabled ? 'checkmark-circle' : 'close-circle'}
                              size={16}
                              color={feat.enabled ? colors.accent : colors.textMuted}
                            />
                            <ThemedText style={[styles.featureName, !feat.enabled && { opacity: 0.5 }]}>
                              {feat.name} {feat.unlimited ? '(Không giới hạn)' : feat.limit ? `(${feat.limit})` : ''}
                            </ThemedText>
                          </View>
                        ))}
                      </View>

                      {price.amountMinor > 0 && (
                        <TouchableOpacity
                          style={[
                            styles.checkoutButton,
                            { backgroundColor: colors.primary },
                            checkoutMutation.isPending && { opacity: 0.6 }
                          ]}
                          onPress={() => {
                            setSelectedPriceId(price.id);
                            checkoutMutation.mutate(price.id);
                          }}
                          disabled={checkoutMutation.isPending}
                        >
                          {checkoutMutation.isPending && selectedPriceId === price.id ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="card" size={18} color="#fff" style={{ marginRight: 6 }} />
                              <ThemedText style={styles.checkoutButtonText}>Đăng Ký Nâng Cấp</ThemedText>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  priceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '800',
  },
  durationText: {
    fontSize: 13,
    opacity: 0.7,
  },
  quotaText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.85,
  },
  featuresList: {
    gap: 6,
    marginVertical: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureName: {
    fontSize: 13,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  warningSub: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.8,
    marginTop: 2,
  },
});
