import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/interview-history.styles';

export const HistoryPaginationBar = React.memo(({
  page,
  totalPages,
  hasNextPage,
  colors,
  onPrevPage,
  onNextPage,
  bottomOffset = 70,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  colors: any;
  onPrevPage: () => void;
  onNextPage: () => void;
  bottomOffset?: number;
}) => (
  <View style={[styles.floatingNavContainer, { bottom: bottomOffset }]}>
    <View style={[styles.inlineNavContainer, { 
      backgroundColor: colors.card, 
      borderColor: colors.cardBorder, 
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 24
    }]}>
      <TouchableScale
        style={[styles.miniPageBtn, page === 1 ? styles.disabledButton : null]}
        disabled={page === 1}
        onPress={onPrevPage}
      >
        <Ionicons name="chevron-back" size={16} color={page === 1 ? colors.border : colors.primary} />
        <ThemedText style={[styles.miniPageBtnText, { color: page === 1 ? colors.border : colors.textPrimary }]}>
          Trước
        </ThemedText>
      </TouchableScale>

      <ThemedText style={[styles.inlinePageIndicator, { color: colors.textPrimary, marginHorizontal: 16 }]}>
        Trang {page}/{totalPages}
      </ThemedText>

      <TouchableScale
        style={[styles.miniPageBtn, (!hasNextPage) ? styles.disabledButton : null]}
        disabled={!hasNextPage}
        onPress={onNextPage}
      >
        <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.border : colors.textPrimary }]}>
          Sau
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.border : colors.primary} />
      </TouchableScale>
    </View>
  </View>
));
