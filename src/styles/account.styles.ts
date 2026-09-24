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
  topLabelText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Card Structure
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 2,
    lineHeight: 16,
  },

  // Avatar Sub-section
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  avatarActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarSubtext: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
  },

  // Form Fields
  fieldContainer: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  fieldNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  fieldNoteText: {
    fontSize: 11,
    opacity: 0.65,
    lineHeight: 15,
  },

  // Plan & Usage Card Layouts
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricBox: {
    width: '47%',
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  metricBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.65,
  },
  metricBoxValue: {
    fontSize: 13,
    fontWeight: '800',
  },

  ordersSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  ordersTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  orderCardItem: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.one,
  },

  // Privacy & Download Box
  downloadBox: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 8,
  },
  downloadBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  downloadBoxSub: {
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 16,
  },

  // Danger Zone Card
  dangerZoneContainer: {
    padding: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  dangerSub: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 17,
  },

  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    gap: 6,
    alignSelf: 'flex-start',
  },
  btnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
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
  btnSmall: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.xs,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
