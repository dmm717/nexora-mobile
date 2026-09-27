import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/cv-jd.styles';

export const CvJdFloatingPagination = React.memo(({
  showFloatingNav,
  totalHistoryPages,
  historyPage,
  hasNextPage,
  colorScheme,
  colors,
  onPrev,
  onNext,
}: {
  showFloatingNav: boolean;
  totalHistoryPages: number;
  historyPage: number;
  hasNextPage: boolean;
  colorScheme: string;
  colors: any;
  onPrev: () => void;
  onNext: () => void;
}) => {
  if (!showFloatingNav || totalHistoryPages <= 1) return null;
  return (
    <View style={styles.floatingNavContainer}>
      <View style={[styles.inlineNavContainer, {
        backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#fff',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }]}>
        <TouchableScale
          style={[styles.miniPageBtn, historyPage === 1 ? styles.disabledButton : null]}
          disabled={historyPage === 1}
          onPress={onPrev}
        >
          <Ionicons name="chevron-back" size={16} color={historyPage === 1 ? colors.textSecondary : colors.primary} />
          <ThemedText style={[styles.miniPageBtnText, { color: historyPage === 1 ? colors.textSecondary : colors.text }]}>
            Trước
          </ThemedText>
        </TouchableScale>

        <ThemedText style={[styles.inlinePageIndicator, { color: colors.text, marginHorizontal: 16 }]}>
          Trang {historyPage}/{totalHistoryPages}
        </ThemedText>

        <TouchableScale
          style={[styles.miniPageBtn, (!hasNextPage) ? styles.disabledButton : null]}
          disabled={!hasNextPage}
          onPress={onNext}
        >
          <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.textSecondary : colors.text }]}>
            Sau
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.textSecondary : colors.primary} />
        </TouchableScale>
      </View>
    </View>
  );
});
