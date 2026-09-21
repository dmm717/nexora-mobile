import { StyleSheet } from 'react-native';
import { Spacing, Typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  formGap: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 6,
  },
  asterisk: {
    color: '#ef4444'
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  radioGroup: {
    gap: 10,
  },
  radioCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  radioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  radioOuterPremium: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBold: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  uploadTextSub: {
    fontSize: 11,
    marginTop: 4,
  },
  existingCvItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  existingCvName: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
    marginRight: 12,
  },
  currentCvBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cvIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvNameText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
});
