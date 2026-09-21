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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scenarioSummary: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  contentBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
    gap: 6,
  },
  contentHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  contentText: {
    fontSize: 13,
    lineHeight: 19,
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.one,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748B',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  micButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  successText: {
    fontWeight: '700',
    fontSize: 15,
  },
  evaluationBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  evaluationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
