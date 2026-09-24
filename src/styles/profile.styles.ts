import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  centerContainer: {
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // User identity top card (Matching screenshot top block)
  userInfoCard: {
    padding: Spacing.four,
    gap: 6,
    borderRadius: Radius.lg,
  },
  accountLabel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  userEmailText: {
    fontSize: 13,
    opacity: 0.75,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // User menu group card (Matching screenshot menu items)
  menuGroupCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.one,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  menuIconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
  },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.4,
    marginTop: Spacing.one,
  },
});
