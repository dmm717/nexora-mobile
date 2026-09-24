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

  // Scroll content
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
  retryBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.sm,
  },

  // Hero Header Block (CareerProfileHeader)
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
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  heroCtaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Glass Card Layouts
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
    opacity: 0.65,
    marginTop: 2,
    lineHeight: 15,
  },

  // Section 1: Career Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbbf24', // Web yellow avatar
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  identityName: {
    fontSize: 16,
    fontWeight: '800',
  },
  identityEmail: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#d1fae5', // emerald light
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857', // emerald dark
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statusLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Section 2: Career Goals
  activeGoalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activeGoalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activeGoalContainer: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: Spacing.three,
  },
  activeGoalHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid3Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  grid2Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  goalFieldItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    opacity: 0.65,
    fontWeight: '500',
  },
  fieldValBold: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  goalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: 4,
  },

  otherGoalsSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  otherGoalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otherGoalsTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  inactiveGoalCard: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.two,
  },
  inactiveGoalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  inactiveGoalRole: {
    fontSize: 13,
    fontWeight: '800',
  },
  inactiveGoalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inactiveGoalMetaText: {
    fontSize: 11,
    opacity: 0.7,
  },

  // Section 3: Resumes Management
  resumeListContainer: {
    gap: Spacing.two,
  },
  resumeItemCard: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.two,
  },
  resumeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeNameText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  primaryCvBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  primaryCvBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  resumeMetaText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  resumeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },

  // Section 4: Skill Profile & Competencies
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  compCard: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: 6,
  },
  compCategoryText: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '500',
  },
  compNameText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  compScoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  compEvidenceText: {
    fontSize: 10,
    opacity: 0.6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
  },
  compFooterText: {
    fontSize: 10,
    opacity: 0.65,
  },

  // Weakness Signals Container
  weaknessBox: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 8,
    marginTop: Spacing.two,
  },
  weaknessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weaknessTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  weaknessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  weaknessBullet: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  weaknessText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  // Generic Elements
  emptyBox: {
    padding: Spacing.four,
    borderRadius: Radius.sm,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    gap: 6,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  btnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: Radius.xs,
    gap: 4,
  },
  btnSmall: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: Radius.xs,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
