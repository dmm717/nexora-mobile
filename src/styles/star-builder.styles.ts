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
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  sampleText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
  },
  subTip: {
    fontSize: 12,
    opacity: 0.75,
    fontStyle: 'italic',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    height: 130,
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
  starBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: 4,
  },
  starLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  starText: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  warningHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  historyQuestion: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
});
