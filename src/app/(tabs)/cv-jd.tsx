import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenStorage } from '@/services/storage';

import { useCvJdTabState } from '@/components/cv-analysis/cv-jd/useCvJdTabState';
import {
  CvJdFloatingPagination,
  CvJdFormContent,
  LatestAnalysisModal,
} from '@/components/cv-analysis/cv-jd/CvJdSubComponents';
import { styles } from './cv-jd.styles';

export default function CvJdTabScreen() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const state = useCvJdTabState();
  const {
    router,
    showPopup,
    doNotShowAgain,
    setDoNotShowAgain,
    historyPage,
    setHistoryPage,
    showFloatingNav,
    handleScroll,
    isProfileLoading,
    latestCompletedAnalysis,
    totalHistoryPages,
    hasNextPage,
    handleClosePopup,
  } = state;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <ThemedText type="title" style={styles.title}>Phân tích CV</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {isProfileLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : (
            <CvJdFormContent
              state={state}
              colorScheme={colorScheme}
              colors={colors}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <CvJdFloatingPagination
        showFloatingNav={showFloatingNav}
        totalHistoryPages={totalHistoryPages}
        historyPage={historyPage}
        hasNextPage={hasNextPage}
        colorScheme={colorScheme}
        colors={colors}
        onPrev={() => setHistoryPage((p) => Math.max(1, p - 1))}
        onNext={() => setHistoryPage((p) => p + 1)}
      />

      <LatestAnalysisModal
        visible={showPopup}
        latestCompletedAnalysis={latestCompletedAnalysis}
        colors={colors}
        colorScheme={colorScheme}
        doNotShowAgain={doNotShowAgain}
        onClose={handleClosePopup}
        onViewResult={(analysisId) => {
          handleClosePopup();
          router.push(`/(app)/cv-analysis/${analysisId}` as any);
        }}
        onToggleDoNotShow={async () => {
          setDoNotShowAgain(true);
          await tokenStorage.setHidePopup('true');
          handleClosePopup();
        }}
      />
    </ThemedView>
  );
}
