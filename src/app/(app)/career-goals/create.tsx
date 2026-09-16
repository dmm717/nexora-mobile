import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { careerGoalsApi } from '@/api/career-goals.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CreateCareerGoalRequest } from '@/api/types';

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
    createMutation.mutate(form);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Tạo Mục Tiêu</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Vai trò mục tiêu (Target Role) *</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}
              placeholder="VD: Software Engineer"
              placeholderTextColor="#999"
              value={form.targetRole}
              onChangeText={(text) => setForm({ ...form, targetRole: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Cấp bậc (Seniority) *</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}
              placeholder="VD: Senior, Junior, Intern"
              placeholderTextColor="#999"
              value={form.seniority}
              onChangeText={(text) => setForm({ ...form, seniority: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Ngành (Industry)</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}
              placeholder="VD: Fintech, E-commerce"
              placeholderTextColor="#999"
              value={form.industry}
              onChangeText={(text) => setForm({ ...form, industry: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Công ty mục tiêu (Target Company)</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}
              placeholder="VD: Google, VNG"
              placeholderTextColor="#999"
              value={form.targetCompany}
              onChangeText={(text) => setForm({ ...form, targetCompany: text })}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, createMutation.isPending && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Tạo mới</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: { marginRight: Spacing.four },
  title: { fontSize: 20 },
  formContainer: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  inputGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3525CD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  disabledButton: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
