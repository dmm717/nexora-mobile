import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { careerGoalsApi } from '@/api/career-goals.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CreateCareerGoalRequest } from '@/api/types';
import { styles } from '@/styles/career-goals-create.styles';

export default function CreateCareerGoalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateCareerGoalRequest>({
    targetRole: '',
    seniority: '',
    industry: '',
    targetCompany: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCareerGoalRequest) => careerGoalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã tạo mục tiêu nghề nghiệp mới');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Lỗi', 'Không thể tạo mục tiêu. Vui lòng thử lại.');
      console.error(error);
    }
  });

  const handleSubmit = () => {
    if (!form.targetRole.trim() || !form.seniority.trim()) {
      Alert.alert('Lỗi', 'Vai trò và Cấp bậc không được để trống.');
      return;
    }
    createMutation.mutate({
      targetRole: form.targetRole.trim(),
      seniority: form.seniority.trim(),
      industry: form.industry?.trim() || undefined,
      targetCompany: form.targetCompany?.trim() || undefined,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Tạo Mục Tiêu Nghề Nghiệp</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Vai trò mục tiêu (Target Role) *</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="VD: Software Engineer, Product Manager"
                placeholderTextColor={colors.textMuted}
                value={form.targetRole}
                onChangeText={(text) => setForm({ ...form, targetRole: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Cấp bậc (Seniority) *</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="VD: Senior, Middle, Junior, Intern"
                placeholderTextColor={colors.textMuted}
                value={form.seniority}
                onChangeText={(text) => setForm({ ...form, seniority: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Ngành (Industry)</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="VD: Fintech, E-commerce, AI"
                placeholderTextColor={colors.textMuted}
                value={form.industry}
                onChangeText={(text) => setForm({ ...form, industry: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Công ty mục tiêu (Target Company)</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="VD: Google, Shopee, VNG"
                placeholderTextColor={colors.textMuted}
                value={form.targetCompany}
                onChangeText={(text) => setForm({ ...form, targetCompany: text })}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }, createMutation.isPending && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Tạo Mục Tiêu Mới</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
