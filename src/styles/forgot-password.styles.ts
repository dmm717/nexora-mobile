import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 19,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formStack: {
    gap: Spacing.two,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  successText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    width: '100%',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  subLink: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
