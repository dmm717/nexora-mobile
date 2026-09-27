import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/star-builder.styles';

export const StarAnswerInputCard = React.memo(({
  colors,
  answer,
  setAnswer,
  onSubmit,
  isSubmitting,
}: {
  colors: any;
  answer: string;
  setAnswer: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="chatbubble-outline" size={22} color={colors.secondary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Câu Trả Lời Tự Nhiên Của Bạn</ThemedText>
    </View>

    <ThemedText style={styles.subTip}>
      💡 Nhập một câu trả lời tự nhiên dạng văn bản. AI sẽ tự bóc tách thành 4 thành phần S-T-A-R.
    </ThemedText>

    <TextInput
      style={[
        styles.textArea,
        { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }
      ]}
      placeholder="Ví dụ: Trong một dự án E-commerce, hệ thống bị nghẽn thanh toán khi flash sale (Situation). Tôi được giao xử lý khắc phục trong 24h (Task). Tôi đã thêm Redis caching và tối ưu query (Action), giúp hệ thống chịu tải gấp 3 lần không bị sập (Result)..."
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={7}
      value={answer}
      onChangeText={setAnswer}
    />

    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary, width: '100%' },
          (!answer.trim() || isSubmitting) && styles.disabledButton
        ]}
        onPress={onSubmit}
        disabled={!answer.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.submitButtonText}>Phân Tích Cấu Trúc STAR</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
));
