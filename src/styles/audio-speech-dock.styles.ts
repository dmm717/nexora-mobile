import { StyleSheet, Platform } from 'react-native';
import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    padding: Spacing.one,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  draftContainer: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  draftLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  draftPreviewBox: {
    minHeight: 36,
  },
  draftText: {
    fontSize: 13,
    lineHeight: 18,
  },
  draftFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  buttonBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnCallText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  statusHintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
  },
  statusHintText: {
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 3,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  editorCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two + 10,
    gap: 16,
    ...(Platform.select({
      web: { boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 20,
      },
    }) as any),
  },
  sheetHandleBox: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sheetHandlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorHeaderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  editorInput: {
    minHeight: 140,
    fontSize: 14.5,
    lineHeight: 22,
  },
  editorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  wordCounter: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  submitModalBtn: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitModalText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
