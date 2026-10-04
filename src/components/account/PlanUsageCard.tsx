import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import { PlanUsageStatsGrid } from '@/components/profile/plan-usage-stats-grid';
import { styles } from '@/styles/account.styles';
import { formatCurrency } from '@/utils/billing-presentation';
import { formatDate } from '@/utils/career-goal-contract';

export const PlanUsageCard = ({ currentUserData, colors }: { currentUserData: any; colors: any }) => {
  const router = useRouter();

  const billing = currentUserData?.billing;
  const entitlement = billing?.entitlement;
  const orders = billing?.orders || [];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.planHeaderRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ThemedText style={styles.cardTitle}>Gói cước & Sử dụng</ThemedText>
            <View style={[styles.planBadge, { backgroundColor: colors.primaryLight }]}>
              <ThemedText style={[styles.planBadgeText, { color: colors.primary }]}>
                {entitlement?.planCode || 'Chưa có thông tin'}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.cardSubtitle}>
            Thông tin quyền lợi và hạn mức sử dụng tính năng AI của tài khoản.
          </ThemedText>
        </View>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(app)/pricing' as any)}
        >
          <ThemedText style={[styles.btnText, { color: colors.text }]}>Xem quyền lợi</ThemedText>
        </TouchableScale>
      </View>

      <PlanUsageStatsGrid
        startsAt={entitlement?.startsAt}
        endsAt={entitlement?.endsAt}
        consumed={entitlement?.consumed}
        limit={entitlement?.limit}
        available={entitlement?.available}
      />

      {orders.length > 0 && (
        <View style={[styles.ordersSection, { borderTopColor: colors.cardBorder }]}>
          <ThemedText style={styles.ordersTitle}>Lịch sử giao dịch</ThemedText>
          {orders.map((o: any) => (
            <View
              key={o.id}
              style={[
                styles.orderCardItem,
                { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: 12, color: colors.primary }}>
                  #{o.id.slice(-6).toUpperCase()}
                </ThemedText>
                <OrderStatusBadge status={o.status} size="sm" />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>
                  {o.planCode} · {formatDate(o.createdAt)}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '800' }}>
                  {formatCurrency(o.amountMinor, o.currency)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
};
