import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/star-builder.styles';

export const StarQuestionInputCard = React.memo(({
  question,
  setQuestion,
  colors,
}: {
  question: string;
  setQuestion: (q: string) => void;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Tình Huống Phỏng Vấn (Question / Scenario)</ThemedText>
    </View>

    <TextInput
      style={[
        styles.textArea,
        { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement, height: 90 }
      ]}
      placeholder="Nhập câu hỏi hoặc tình huống phỏng vấn bạn muốn rèn luyện..."
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={3}
      value={question}
      onChangeText={setQuestion}
    />
  </View>
));
