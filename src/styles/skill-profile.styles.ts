import { StyleSheet } from 'react-native';
import { Spacing, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  compName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  compCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceText: {
    fontSize: 12,
    opacity: 0.7,
  },
  sourcesBox: {
    padding: Spacing.two,
    borderRadius: Radius.md,
    gap: 4,
    marginTop: Spacing.one,
  },
  sourcesHeader: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  sourceChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  signalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  signalMeta: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
});
