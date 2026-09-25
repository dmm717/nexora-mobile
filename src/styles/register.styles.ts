import { StyleSheet } from 'react-native';
import { Typography, Colors } from '@/constants/theme';

const SYSTEM_PRIMARY = Colors.light.primary;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  
  /* Register Section */
  registerSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  registerHeader: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  registerTitle: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.extrabold,
    color: '#131b2e',
    lineHeight: 40,
  },
  registerUnderline: {
    width: 76,
    height: 3,
    backgroundColor: SYSTEM_PRIMARY,
    marginTop: 4,
    borderRadius: 2,
  },
  
  /* Form Inputs */
  formStack: {
    gap: 18,
  },
  fieldGroup: {
    marginBottom: 2,
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

  /* Bottom Sign In Link */
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
});

