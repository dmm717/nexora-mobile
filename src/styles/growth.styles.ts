import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  metricCard: {
    padding: Spacing.five,
    borderRadius: Radius.lg,
    gap: Spacing.four,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  metricBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  metricScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricNumber: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 52,
  },
  metricPercent: {
    fontSize: 20,
    fontWeight: '700',
    opacity: 0.5,
    marginLeft: 2,
  },
  metricInfo: {
    flex: 1,
    gap: 4,
  },
  metricStatus: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.9,
    paddingHorizontal: 2,
  },
  listGroup: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  listIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTextContent: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 13,
    opacity: 0.6,
  },
  listDivider: {
    height: 1,
    width: '100%',
  },
});
