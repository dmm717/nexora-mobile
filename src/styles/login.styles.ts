import { StyleSheet } from 'react-native';
import { Typography, Colors } from '@/constants/theme';

const SYSTEM_PRIMARY = Colors.light.primary; // '#1b33c7'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    backgroundColor: '#FFFFFF',
  },
  splashLogo: {
    width: 120,
    height: 120,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  headerWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  
  /* Welcome Screen */
  welcomeSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
    minHeight: 280,
  },
  welcomeTextGroup: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 36,
    fontFamily: Typography.fontFamily.extrabold,
    color: '#131b2e',
    lineHeight: 44,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: '#757686',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  welcomeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginBottom: 16,
  },
  continueText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: '#444655',
    marginRight: 12,
  },
  continueCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SYSTEM_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SYSTEM_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },

  /* Sign In Screen */
  signInSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  signInHeader: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  signInTitle: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.extrabold,
    color: '#131b2e',
    lineHeight: 40,
  },
  signInUnderline: {
    width: 76,
    height: 3,
    backgroundColor: SYSTEM_PRIMARY,
    marginTop: 4,
    borderRadius: 2,
  },
  
  /* Form Inputs */
  formStack: {
    gap: 20,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: '#131b2e',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#c5c5d7',
    paddingBottom: 10,
  },
  inputRowFocused: {
    borderBottomColor: SYSTEM_PRIMARY,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: '#131b2e',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  eyeIcon: {
    padding: 4,
  },

  /* Options Row */
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  rememberMeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: SYSTEM_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: SYSTEM_PRIMARY,
  },
  rememberText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semibold,
    color: '#444655',
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    color: SYSTEM_PRIMARY,
  },

  /* Primary Button */
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: SYSTEM_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    shadowColor: SYSTEM_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },

  /* Bottom Sign Up Link */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#757686',
  },
  linkText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: SYSTEM_PRIMARY,
  },
  subLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  
  /* Success Card */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dfe0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: '#444655',
    lineHeight: 22,
    marginBottom: 20,
  },
});



