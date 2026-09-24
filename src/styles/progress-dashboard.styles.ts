import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  
  // Top nav header bar
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
  },

  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },

  // Main Page Header Block (Matching Web Hero Header)
  pageHeaderBlock: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  goalSubheading: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  headerBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  headerBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
    gap: 6,
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Top Summary Metrics Section
  readinessCard: {
    padding: Spacing.four,
  },
  readinessContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  readinessTextCol: {
    flex: 1,
    gap: 4,
  },
  readinessLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  readinessScoreTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  readinessSubtext: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },

  // Side metric 2-column cards
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  metricCardSmall: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
    flex: 1,
  },
  metricBigNum: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: Spacing.one,
  },
  metricCardSub: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },

  // Next Practice Recommendation Banner
  recBanner: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recTimePill: {
    fontSize: 11,
    opacity: 0.7,
  },
  recReasonText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  recBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    gap: 6,
  },
  recBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Quantified Competencies Section
  compSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  compSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  compSectionGoal: {
    fontSize: 11,
    opacity: 0.6,
  },

  compCard: {
    padding: Spacing.three,
    gap: 8,
    borderWidth: 1,
  },
  compHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compName: {
    fontSize: 13,
    fontWeight: '700',
  },
  compCategory: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 1,
  },
  compScoreText: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Weakest Competencies Section
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  weakRow: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: 6,
    borderWidth: 1,
  },
  weakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weakName: {
    fontSize: 13,
    fontWeight: '700',
  },
  weakScoreText: {
    fontSize: 13,
    fontWeight: '800',
  },
  weakExplanationText: {
    fontSize: 11,
    opacity: 0.65,
    lineHeight: 15,
  },
  weakPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  weakPracticeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Recent Improvements Section
  impRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: Spacing.two,
    borderWidth: 1,
  },
  impTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  impTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  impDetail: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  impDate: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Alert Banners
  alertBanner: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  alertRetryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  alertRetryText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
