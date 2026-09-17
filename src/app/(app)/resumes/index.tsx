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
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
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
      const intent = await resumesApi.presign({
        fileName: file.name,
        contentType: file.mimeType || 'application/pdf',
        size: file.size || 0,
      });

      const uploadResult = await FileSystem.uploadAsync(intent.uploadUrl, file.uri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': file.mimeType || 'application/pdf',
        },
      });

      if (uploadResult.status !== 200) {
        throw new Error('Upload to S3 failed');
      }

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
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Quản Lý CV</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: colors.primary }, uploadMutation.isPending && styles.disabledButton]} 
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.uploadButtonText}>Tải lên CV mới (PDF/DOCX)</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {isError ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={styles.emptyText}>Có lỗi xảy ra khi tải danh sách CV.</ThemedText>
            </View>
          ) : resumes?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <ThemedText style={styles.emptyText}>Chưa có CV nào được tải lên.</ThemedText>
            </View>
          ) : (
            resumes?.map((resume) => (
              <View 
                key={resume.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colors.card, borderColor: resume.id === primaryResumeId ? colors.accent : colors.cardBorder },
                  resume.id === primaryResumeId && styles.primaryCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.resumeTitleRow}>
                    <Ionicons name="document-text" size={22} color={resume.id === primaryResumeId ? colors.accent : colors.primary} />
                    <ThemedText style={styles.resumeName}>{resume.fileName}</ThemedText>
                  </View>
                  {resume.id === primaryResumeId && (
                    <View style={[styles.primaryBadge, { backgroundColor: colors.accent }]}>
                      <ThemedText style={styles.primaryBadgeText}>CV Chính</ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.detailsRow}>
                  <View style={[styles.statusChip, { backgroundColor: colors.primaryLight }]}>
                    <ThemedText style={[styles.statusChipText, { color: colors.primary }]}>
                      Trạng thái: {resume.status}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.resumeDetail}>
                    {(resume.size / 1024).toFixed(1)} KB
                  </ThemedText>
                </View>
                
                {resume.id !== primaryResumeId && resume.status === 'ready' && (
                  <TouchableOpacity 
                    style={[styles.setPrimaryBtn, { backgroundColor: colors.accentLight }]}
                    onPress={() => setPrimaryMutation.mutate(resume.id)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    <ThemedText style={[styles.setPrimaryText, { color: colors.accent }]}>
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
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    ...Shadows.sm,
  },
  disabledButton: { opacity: 0.7 },
  uploadButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: { opacity: 0.6, fontStyle: 'italic', textAlign: 'center' },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
  },
  primaryCard: { borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  resumeName: { fontWeight: '700', fontSize: 16, flex: 1 },
  primaryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  primaryBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  resumeDetail: { fontSize: 13, opacity: 0.7 },
  setPrimaryBtn: {
    marginTop: Spacing.one,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  setPrimaryText: {
    fontWeight: '700',
    fontSize: 13,
  }
});
