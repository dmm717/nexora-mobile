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
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.six,
  },
  centerContainer: {
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderCenter: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  avatarPlaceholderLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarTextLarge: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileNameLarge: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileEmailCenter: {
    fontSize: 14,
    opacity: 0.6,
  },
  xpBadgeCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  xpTextCenter: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
    marginLeft: Spacing.one,
  },
  settingsGroup: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  settingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 14,
    opacity: 0.6,
    maxWidth: '50%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    width: '100%',
    marginLeft: 60,
  },
  logoutBtn: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.4,
    marginTop: Spacing.two,
  },
});
