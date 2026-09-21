import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: { padding: Spacing.one, marginRight: Spacing.two },
  title: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  uploadButton: {
    borderRadius: Radius.sm,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  disabledButton: { opacity: 0.7 },
  uploadButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyText: { opacity: 0.7, fontStyle: 'italic', textAlign: 'center', fontSize: 14 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    marginTop: Spacing.one,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  resumeName: { fontWeight: '700', fontSize: 15, flex: 1 },
  primaryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.xs },
  primaryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.xs },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  resumeDetail: { fontSize: 12, opacity: 0.7 },
  setPrimaryBtn: {
    marginTop: Spacing.one,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  setPrimaryText: {
    fontWeight: '700',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  deleteBtn: {
    padding: Spacing.two,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
