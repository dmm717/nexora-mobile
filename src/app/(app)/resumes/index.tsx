import React from 'react';
import { StyleSheet, ScrollView, View, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { ThemedText } from '@/components/themed-text';
import { resumesApi } from '@/api/resumes.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function ResumesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

  const { data: resumes, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
  });

  const { data: profile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const primaryResumeId = profile?.primaryResume?.id;
  const resumeList = Array.isArray(resumes) ? resumes : [];

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
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã tải lên CV thành công');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể tải lên CV. Vui lòng thử lại.');
      console.error(error);
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      await profileApi.setPrimaryResume({ resumeId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      Alert.alert('Thành công', 'Đã đặt làm CV chính');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.message || 'Không thể đặt CV làm CV chính.');
    }
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

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableScale onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/cv-jd');
            }
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableScale>
          <ThemedText type="title" style={styles.title}>Quản Lý CV</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Upload Button */}
          <TouchableScale 
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
          </TouchableScale>

          {/* Loading state */}
          {isLoading && !isRefetching ? (
            <View style={{ gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : isError ? (
            <GlassCard style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={styles.emptyText}>
                {(error as any)?.message ? `[${(error as any)?.code || 'Lỗi'}] ${(error as any)?.message}` : 'Có lỗi xảy ra khi tải danh sách CV.'}
              </ThemedText>
              <TouchableScale
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={() => refetch()}
              >
                <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
                <ThemedText style={styles.retryBtnText}>Thử lại ngay</ThemedText>
              </TouchableScale>
            </GlassCard>
          ) : resumeList.length === 0 ? (
            <GlassCard style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <ThemedText style={styles.emptyText}>Chưa có CV nào được tải lên.</ThemedText>
            </GlassCard>
          ) : (
            resumeList.map((resume) => {
              const isPrimary = resume.id === primaryResumeId;
              return (
                <GlassCard 
                  key={resume.id}
                  hasGlow={isPrimary}
                  glowColor={colors.glowSecondary}
                  borderColor={isPrimary ? colors.accent : colors.cardBorder}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.resumeTitleRow}>
                      <Ionicons name="document-text" size={24} color={isPrimary ? colors.accent : colors.primary} />
                      <ThemedText style={styles.resumeName}>{resume.fileName}</ThemedText>
                    </View>
                    {isPrimary && (
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
                  
                  {!isPrimary && resume.status === 'ready' && (
                    <TouchableScale 
                      style={[styles.setPrimaryBtn, { backgroundColor: colors.accentLight }]}
                      onPress={() => setPrimaryMutation.mutate(resume.id)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      <ThemedText style={[styles.setPrimaryText, { color: colors.accent }]}>
                        {setPrimaryMutation.isPending ? 'Đang đặt...' : 'Đặt làm CV chính'}
                      </ThemedText>
                    </TouchableScale>
                  )}
                </GlassCard>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: { padding: Spacing.one, marginRight: Spacing.two },
  title: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  uploadButton: {
    borderRadius: Radius.sm,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  disabledButton: { opacity: 0.7 },
  uploadButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyText: { opacity: 0.7, fontStyle: 'italic', textAlign: 'center', fontSize: 14 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    marginTop: Spacing.one,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  resumeName: { fontWeight: '700', fontSize: 15, flex: 1 },
  primaryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.xs },
  primaryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.xs },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  resumeDetail: { fontSize: 12, opacity: 0.7 },
  setPrimaryBtn: {
    marginTop: Spacing.one,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  setPrimaryText: {
    fontWeight: '700',
    fontSize: 13,
  }
});
