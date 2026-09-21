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
  heroCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  heroContent: {
    padding: Spacing.five,
    alignItems: 'flex-start',
    gap: Spacing.four,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heroTextContainer: {
    gap: Spacing.one,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  heroActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
  gridContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  gridItemWrapper: {
    flex: 1,
  },
  gridCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    alignItems: 'flex-start',
    gap: Spacing.two,
    height: '100%',
  },
  gridIconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gridSub: {
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.three,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
