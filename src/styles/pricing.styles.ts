import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Navigation Header
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.one,
    marginRight: Spacing.two,
  },
  headerNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // Scroll Content
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Header Block
  heroBlock: {
    gap: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subHeading: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 17,
  },

  // Card 1: GÓI HIỆN TẠI (Current Entitlement)
  entitlementCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  entitlementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  entitlementHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planCodeText: {
    fontSize: 22,
    fontWeight: '900',
  },
  activeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activeStatusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  expiryLabel: {
    fontSize: 11,
    opacity: 0.65,
    textAlign: 'right',
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 2,
  },

  // 3 Quota Highlight Boxes
  quotaGrid: {
    gap: Spacing.two,
  },
  quotaBox: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  quotaBoxLabel: {
    fontSize: 11,
    opacity: 0.65,
    fontWeight: '600',
  },
  quotaBoxValue: {
    fontSize: 18,
    fontWeight: '900',
  },

  // Section 2: Nâng cấp gói dịch vụ (Upgrade Plans)
  sectionHeaderBlock: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
  },

  plansStack: {
    gap: Spacing.four,
  },
  planCard: {
    padding: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.three,
    position: 'relative',
  },
  highlightedPlanCard: {
    borderWidth: 2,
    shadowColor: '#1b33c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  topBadgeContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    zIndex: 10,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },

  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planNameText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  currentPlanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  currentPlanBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  planDescText: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 17,
  },

  priceDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  priceAmountText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  priceDurationText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '600',
  },

  featuresContainer: {
    gap: 10,
    paddingVertical: Spacing.one,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
  },

  planActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.sm,
    gap: 6,
    marginTop: Spacing.one,
  },
  planActionText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Section 3: Lịch sử giao dịch (Orders History)
  ordersContainer: {
    gap: Spacing.two,
  },
  orderItemCard: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.two,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderCodeText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  orderPlanCode: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderDateText: {
    fontSize: 11,
    opacity: 0.65,
  },
  orderAmountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
