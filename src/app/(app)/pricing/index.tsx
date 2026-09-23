import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pricingApi } from '@/api/pricing.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/pricing.styles';

export default function PricingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['user-quota'] });
      if (data.checkout?.url) {
        Alert.alert(
          'Đơn Hàng Đã Tạo',
          `Mã đơn hàng: ${data.orderId}\nSố tiền: ${data.amountMinor.toLocaleString('vi-VN')} ${data.currency}\n\nĐang chuyển đến cổng thanh toán an toàn...`,
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

  const describeFeature = (feat: { name: string; enabled: boolean; limit?: number | null; unlimited: boolean }) => {
    if (!feat.enabled) return null;
    if (feat.unlimited) return `${feat.name}: Không giới hạn`;
    if (feat.limit !== null && feat.limit !== undefined) return `${feat.name}: ${feat.limit}`;
    return feat.name;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.title}>Gói Dịch Vụ & Bảng Giá</ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
              Đồng hành cùng bạn trên hành trình chinh phục phỏng vấn
            </ThemedText>
          </View>
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
                🔒 Tuân Thủ Chính Sách Store & Bảo Mật Quyền Hạn
              </ThemedText>
              <ThemedText style={styles.warningSub}>
                Không ép buộc thanh toán sớm. Bạn có thể thử nghiệm gói Miễn phí trước khi quyết định nâng cấp. Quyền hạn tính năng được xác thực tập trung từ hệ thống authoritative backend.
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
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>Chưa thể tải danh sách gói cước. Vui lòng thử lại sau.</ThemedText>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <ThemedText type="subtitle" style={styles.planName}>{plan.name}</ThemedText>
                        {plan.isHighlighted && (
                          <View style={[styles.badge, { backgroundColor: colors.accent || '#10b981' }]}>
                            <Ionicons name="sparkles" size={12} color="#ffffff" style={{ marginRight: 3 }} />
                            <ThemedText style={[styles.badgeText, { color: '#ffffff' }]}>Phổ biến nhất</ThemedText>
                          </View>
                        )}
                        {plan.badge && !plan.isHighlighted && (
                          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                            <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{plan.badge}</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.planDesc}>
                        {plan.description || 'Gói dịch vụ được thiết kế tối ưu cho nhu cầu rèn luyện phỏng vấn của bạn.'}
                      </ThemedText>
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
                          {price.durationDays > 0 ? `/ ${price.durationDays} ngày` : 'Sử dụng linh hoạt'}
                        </ThemedText>
                      </View>

                      <ThemedText style={styles.quotaText}>
                        Hạn mức phỏng vấn: {price.interviewQuota > 0 ? `${price.interviewQuota} lượt` : price.interviewQuota === 0 ? '0 lượt' : 'Không giới hạn'}
                      </ThemedText>

                      {/* Features Checklist */}
                      <View style={styles.featuresList}>
                        {price.features.map((feat, fIdx) => {
                          const desc = describeFeature(feat);
                          if (!desc) return null;
                          return (
                            <View key={fIdx} style={styles.featureRow}>
                              <Ionicons
                                name={feat.enabled ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={feat.enabled ? (colors.accent || '#10b981') : colors.textMuted}
                              />
                              <ThemedText style={[styles.featureName, !feat.enabled && { opacity: 0.5 }]}>
                                {desc}
                              </ThemedText>
                            </View>
                          );
                        })}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.checkoutButton,
                          {
                            backgroundColor: price.amountMinor === 0
                              ? (colors.cardBorder || '#cbd5e1')
                              : (colors.primary || '#6366f1'),
                          },
                          checkoutMutation.isPending && { opacity: 0.6 }
                        ]}
                        onPress={() => {
                          if (price.amountMinor > 0) {
                            setSelectedPriceId(price.id);
                            checkoutMutation.mutate(price.id);
                          } else {
                            router.push('/(tabs)/home' as any);
                          }
                        }}
                        disabled={checkoutMutation.isPending}
                      >
                        {checkoutMutation.isPending && selectedPriceId === price.id ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Ionicons
                              name={price.amountMinor > 0 ? 'card-outline' : 'checkmark-circle-outline'}
                              size={18}
                              color={price.amountMinor === 0 ? colors.text : '#fff'}
                              style={{ marginRight: 6 }}
                            />
                            <ThemedText
                              style={[
                                styles.checkoutButtonText,
                                price.amountMinor === 0 && { color: colors.text }
                              ]}
                            >
                              {price.amountMinor === 0 ? 'Bắt đầu miễn phí' : 'Chọn gói này'}
                            </ThemedText>
                          </>
                        )}
                      </TouchableOpacity>
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
