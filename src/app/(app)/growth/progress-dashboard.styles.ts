import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: { padding: Spacing.one, marginRight: Spacing.two },
  title: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: Spacing.three, gap: Spacing.three },
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeaderRow: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  readinessBox: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 18,
    opacity: 0.6,
    marginLeft: 4,
  },
  nullScoreBox: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: 8,
  },
  nullScoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
  readinessGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.sm,
  },
  gridNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  gridLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'center',
  },
  weeklyGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  weeklyStat: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Radius.sm,
  },
  weeklyNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  weeklyLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  weakRow: {
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: Spacing.two,
  },
  weakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weakName: {
    fontSize: 14,
    fontWeight: '700',
  },
  weakMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  impRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.sm,
    gap: Spacing.two,
  },
  impTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  impDate: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
});
