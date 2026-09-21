import { StyleSheet } from 'react-native';
import { Spacing, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  createButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    ...Shadows.sm,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.two,
  },
  activeCard: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalRole: {
    fontWeight: '700',
    fontSize: 17,
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  seniorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  seniorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  setActiveBtn: {
    marginTop: Spacing.two,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  setActiveText: {
    fontWeight: '700',
    fontSize: 13,
  }
});
