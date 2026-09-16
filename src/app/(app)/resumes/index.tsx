import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resumesApi } from '@/api/resumes.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResumesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

  const { data: resumes, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
  });

  const { data: profile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const primaryResumeId = profile?.primaryResume?.id;

  const uploadMutation = useMutation({
    mutationFn: async (file: DocumentPicker.DocumentPickerAsset) => {
      // 1. Lấy presign URL
      const intent = await resumesApi.presign({
        fileName: file.name,
        contentType: file.mimeType || 'application/pdf',
        size: file.size || 0,
      });

      // 2. Đọc file dưới dạng base64 rồi chuyển sang mảng bytes (hoặc upload trực tiếp qua FileSystem nếu uploadUrl hỗ trợ)
      // Dùng expo-file-system upload
      const uploadResult = await FileSystem.uploadAsync(intent.uploadUrl, file.uri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': file.mimeType || 'application/pdf',
        },
      });

      if (uploadResult.status !== 200) {
        throw new Error('Upload to S3 failed');
      }

      // 3. Finalize
      await resumesApi.finalize({ uploadToken: intent.token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      Alert.alert('Thành công', 'Đã tải lên CV thành công');
    },
    onError: (error) => {
      Alert.alert('Lỗi', 'Không thể tải lên CV. Vui lòng thử lại.');
      console.error(error);
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      await profileApi.setPrimaryResume({ resumeId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã đặt làm CV chính');
    },
  });

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadMutation.mutate(result.assets[0]);
      }
    } catch (err) {
      console.error('Lỗi khi chọn file', err);
    }
  };

  if (isLoading && !isRefetching) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3525CD" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Quản lý CV</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <TouchableOpacity 
            style={[styles.uploadButton, uploadMutation.isPending && styles.disabledButton]} 
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.uploadButtonText}>Tải lên CV mới</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {isError ? (
            <ThemedText style={styles.emptyText}>Có lỗi xảy ra khi tải danh sách CV.</ThemedText>
          ) : resumes?.length === 0 ? (
            <ThemedText style={styles.emptyText}>Chưa có CV nào được tải lên.</ThemedText>
          ) : (
            resumes?.map((resume) => (
              <View 
                key={resume.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' },
                  resume.id === primaryResumeId && styles.primaryCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.resumeName}>{resume.fileName}</ThemedText>
                  {resume.id === primaryResumeId && (
                    <View style={styles.primaryBadge}>
                      <ThemedText style={styles.primaryBadgeText}>CV Chính</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.resumeDetail}>Trạng thái: {resume.status}</ThemedText>
                <ThemedText style={styles.resumeDetail}>
                  Kích thước: {(resume.size / 1024).toFixed(2)} KB
                </ThemedText>
                
                {resume.id !== primaryResumeId && resume.status === 'ready' && (
                  <TouchableOpacity 
                    style={styles.setPrimaryBtn}
                    onPress={() => setPrimaryMutation.mutate(resume.id)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    <ThemedText style={styles.setPrimaryText}>
                      {setPrimaryMutation.isPending ? 'Đang đặt...' : 'Đặt làm CV chính'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
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
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadButton: {
    backgroundColor: '#3525CD',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  disabledButton: { opacity: 0.7 },
  uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: Spacing.two,
  },
  primaryCard: { borderWidth: 2, borderColor: '#3525CD' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeName: { fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  primaryBadge: { backgroundColor: '#3525CD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  primaryBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  resumeDetail: { fontSize: 13, opacity: 0.7 },
  emptyText: { opacity: 0.6, fontStyle: 'italic', textAlign: 'center', marginTop: Spacing.six },
  setPrimaryBtn: {
    marginTop: Spacing.two,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(53, 37, 205, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setPrimaryText: {
    color: '#3525CD',
    fontWeight: '600',
    fontSize: 13,
  }
});
