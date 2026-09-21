import { StyleSheet, Platform } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { gap: Spacing.four, paddingBottom: 40 },
  card: { borderRadius: Radius.lg, padding: Spacing.four, borderWidth: 1 },
  
  // Tabs Styles
  tabsContainer: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: Spacing.two },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)' },
  tabText: { fontSize: 13, opacity: 0.7 },
  tabContent: { minHeight: 300 },

  // Loading Styles
  loadingContainer: { minHeight: 400, alignItems: 'center', justifyContent: 'center', padding: Spacing.six },
  loadingIconWrapper: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.six },
  pulseCircle: { borderRadius: 40 },
  mainIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' },
  loadingTextContainer: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.six },
  loadingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 8 },
  loadingBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  loadingBadgeText: { fontSize: 12, fontWeight: '600' },
  loadingTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  loadingDesc: { fontSize: 13, textAlign: 'center', opacity: 0.7, maxWidth: 280, lineHeight: 20 },
  loadingBarTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.four, position: 'relative' },
  loadingBarFill: { height: '100%', position: 'absolute' },
  loadingHint: { fontSize: 11, opacity: 0.5 },

  // Failed Styles
  failedContainer: { padding: Spacing.six, alignItems: 'center', gap: Spacing.four, marginTop: 40 },
  failedIconBox: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  failedTitle: { fontSize: 18, fontWeight: 'bold' },
  failedDesc: { fontSize: 13, textAlign: 'center', opacity: 0.7, lineHeight: 20 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  btnPrimaryText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  // Success Styles
  cardHeaderRow: { flexDirection: 'row', marginBottom: Spacing.four },
  tag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, marginBottom: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  mainTitle: { fontSize: 22, fontWeight: 'bold', lineHeight: 30 },
  radialScoreWrapper: { padding: Spacing.four, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  summaryBox: { marginTop: Spacing.four, padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  summaryHeader: { fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  summaryText: { fontSize: 13, lineHeight: 22 },

  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  scaleHint: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', opacity: 0.6 },
  breakdownList: { gap: Spacing.two },
  
  keywordsContainer: { gap: 0 },
  kwHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kwIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipMatched: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  chipMatchedText: { color: '#065F46', fontSize: 12, fontWeight: '600' },
  chipMissing: { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FECACA' },
  chipMissingText: { color: '#991B1B', fontSize: 12, fontWeight: '600' },

  listSection: { gap: 8 },
  listHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listItemText: { fontSize: 13, flex: 1, lineHeight: 20 },

  emptyBox: { padding: Spacing.six, borderRadius: Radius.md, alignItems: 'center' },
  emptyText: { fontSize: 12, opacity: 0.6 },

  metaContainer: { marginTop: Spacing.two, gap: 4 },
  metaText: { fontSize: 12, opacity: 0.8 },
  versionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.four, paddingTop: Spacing.three, borderTopWidth: 1 },
  versionText: { fontSize: 11, opacity: 0.6, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  feedbackBox: { padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  feedbackBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  feedbackBoxTitle: { fontSize: 13, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#64748B', marginTop: 8 },

  ctaBanner: { padding: Spacing.six, borderRadius: Radius.lg, marginTop: Spacing.four, alignItems: 'center', gap: Spacing.three },
  ctaBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  ctaBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  ctaTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginBottom: Spacing.two },
  ctaButton: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { fontWeight: 'bold', fontSize: 14 },
});
