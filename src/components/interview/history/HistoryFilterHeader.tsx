import React from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/interview-history.styles';

type FilterType = 'all' | 'active' | 'completed';

export const HistoryFilterHeader = React.memo(({
  filter,
  colors,
  totalCountAll,
  totalCountActive,
  totalCountCompleted,
  onFilterChange,
}: {
  filter: FilterType;
  colors: any;
  totalCountAll: number;
  totalCountActive: number;
  totalCountCompleted: number;
  onFilterChange: (newFilter: FilterType) => void;
}) => (
  <View style={styles.topControlContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarScroll}>
      <View>
        <TouchableScale
          onPress={() => onFilterChange('all')}
          style={[
            styles.filterChip,
            filter === 'all'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'all' ? '#ffffff' : colors.textSecondary }]}>
            Tất cả ({totalCountAll})
          </ThemedText>
        </TouchableScale>
      </View>

      <View>
        <TouchableScale
          onPress={() => onFilterChange('active')}
          style={[
            styles.filterChip,
            filter === 'active'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'active' ? '#ffffff' : colors.textSecondary }]}>
            Đang làm ({totalCountActive})
          </ThemedText>
        </TouchableScale>
      </View>

      <View>
        <TouchableScale
          onPress={() => onFilterChange('completed')}
          style={[
            styles.filterChip,
            filter === 'completed'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'completed' ? '#ffffff' : colors.textSecondary }]}>
            Đã xong ({totalCountCompleted})
          </ThemedText>
        </TouchableScale>
      </View>
    </ScrollView>
  </View>
));
