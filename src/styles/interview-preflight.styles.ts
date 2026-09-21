import { StyleSheet } from 'react-native';
import { Spacing, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeGrid: {
    gap: Spacing.two,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
  },
  typeCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionSub: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Shadows.md,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

