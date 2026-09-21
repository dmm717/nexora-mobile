import { StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 130,
    height: 130,
  },
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
    width: 64,
    height: 64,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  formStack: {
    gap: Spacing.two,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
