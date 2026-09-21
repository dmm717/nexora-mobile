import { StyleSheet } from 'react-native';
import { Spacing, Typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  brandHeaderGroup: {
    flex: 1,
    marginRight: Spacing.two,
  },
  appName: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
  },
  greetingText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  headerBtnGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtnPrimaryCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  headerBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },
  headerBtnSecondaryCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  headerBtnSecondaryText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  // COMBINED HERO CARD
  combinedHeroCard: {
    padding: Spacing.three,
    borderRadius: 14,
  },
  combinedHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCol: {
    flex: 1,
    paddingHorizontal: 4,
    gap: 2,
  },
  verticalDivider: {
    width: 1,
    height: '80%',
    marginHorizontal: Spacing.two,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  badgeSubRow: {
    marginTop: 2,
  },
  // UNIFIED DASHBOARD CARD
  unifiedDashboardCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  actionSubCard: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  detailLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  readinessBody: {
    gap: Spacing.two,
  },
  centeredReadinessBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    gap: 4,
  },
  centeredScoreTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  centeredScoreSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: 6,
  },
  gapAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    gap: 8,
    width: '100%',
  },
  gapIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gapAlertText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
  },
  emptyReadinessBox: {
    paddingVertical: Spacing.two,
    gap: 2,
  },
  emptyReadinessTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyReadinessSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  // SPOTLIGHT INSIDE DASHBOARD CARD
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightBadge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  spotlightTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  spotlightDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  secondaryLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  secondaryLinkBtnText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  // INSIGHT PANEL
  insightPanel: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  insightTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  insightDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 16,
    marginTop: 2,
  },
  // RECENT ACTIVITIES (HORIZONTAL MINI CAROUSEL)
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  seeAllLink: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  horizontalCarouselContainer: {
    gap: Spacing.three,
    paddingRight: Spacing.two,
  },
  miniCarouselCard: {
    width: 215,
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  miniCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniActIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniActTypeLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  miniCardTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  miniCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  miniCardTime: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
  },
  actScorePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actScoreText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyActivityCard: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 2,
  },
  emptyActTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
  },
  emptyActSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  // GROUPED INSET SURFACE CARD FOR 3 BOTTOM ITEMS
  groupedInsetCard: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
  },
  insetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  navCardValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  navCardSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});
