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
    maxWidth: 300,
    lineHeight: 19,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formStack: {
    gap: Spacing.two,
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
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
  backRow: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});
