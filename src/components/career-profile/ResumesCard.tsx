import React, { useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';

import { profileApi } from '@/api/profile.api';
import { resumesApi } from '@/api/resumes.api';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/career-profile.styles';
import { formatFileSize, formatDate } from '@/utils/career-goal-contract';
import { toast } from '@/components/ui/toast/ToastProvider';

interface ResumesCardProps {
  resumes: any[];
  primaryResume: any;
  colors: any;
}

export const ResumesCard = ({ resumes, primaryResume, colors }: ResumesCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const setPrimaryResumeMutation = useMutation({
    mutationFn: (resumeId: string | null) => profileApi.setPrimaryResume({ resumeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Đã cập nhật CV chính');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể cập nhật CV chính.');
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => resumesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      toast.success('Đã xóa CV');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể xóa CV.');
    },
  });

  const handleDeleteResumePrompt = (id: string, fileName: string) => {
    Alert.alert(
      'Xóa CV',
      `Bạn có chắc chắn muốn xóa CV "${fileName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteResumeMutation.mutate(id),
        },
      ]
    );
  };

  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const handleUploadNewCv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsUploadingCv(true);

        const intent = await resumesApi.presign({
          fileName: file.name,
          contentType: file.mimeType || 'application/pdf',
          size: file.size || 0,
        });

        const response = await fetch(file.uri);
        const fileBlob = await response.blob();

        await resumesApi.uploadRawBytes(
          intent.uploadUrl,
          fileBlob,
          file.mimeType || 'application/pdf'
        );

        await resumesApi.finalize({ uploadToken: intent.token });

        queryClient.invalidateQueries({ queryKey: ['resumes'] });
        queryClient.invalidateQueries({ queryKey: ['career-profile'] });
        toast.success('Đã tải lên CV mới thành công!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải lên CV. Vui lòng thử lại.');
    } finally {
      setIsUploadingCv(false);
    }
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBadge, { backgroundColor: '#d1fae5' }]}>
            <Ionicons name="document-text-outline" size={20} color="#047857" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.cardTitle}>Quản lý CV & Hồ sơ đính kèm</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Chỉ 1 CV được đánh dấu là CV chính (Primary Resume) dùng làm nguồn bối cảnh mặc định cho các bài test.
            </ThemedText>
          </View>
        </View>

        <TouchableScale
          style={[
            styles.btnPrimary,
            { backgroundColor: colors.primary },
            isUploadingCv && { opacity: 0.6 },
          ]}
          onPress={handleUploadNewCv}
          disabled={isUploadingCv}
        >
          {isUploadingCv ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={15} color="#ffffff" />
          )}
          <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
            {isUploadingCv ? 'Đang tải lên...' : 'Tải thêm CV mới'}
          </ThemedText>
        </TouchableScale>
      </View>

      {resumes.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="document-outline" size={28} color={colors.textMuted} />
          <ThemedText style={styles.emptyTitle}>Bạn chưa có CV nào trong hồ sơ</ThemedText>
          <ThemedText style={styles.emptySub}>
            Hãy tải lên bản CV đầu tiên để làm dữ liệu bối cảnh cho các bài kiểm tra năng lực và phỏng vấn AI.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.resumeListContainer}>
          {resumes.map((res) => {
            const isPrimary = res.id === primaryResume?.id;
            const isReady = res.status === 'ready';

            return (
              <View
                key={res.id}
                style={[
                  styles.resumeItemCard,
                  {
                    backgroundColor: isPrimary ? colors.secondaryLight : colors.backgroundElement,
                    borderColor: isPrimary ? colors.secondary : colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.resumeItemHeader}>
                  <View style={[styles.fileIconBox, { backgroundColor: isPrimary ? colors.secondary : colors.primaryLight }]}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={isPrimary ? '#ffffff' : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <ThemedText style={styles.resumeNameText} numberOfLines={1}>
                        {res.fileName || 'CV Không tên'}
                      </ThemedText>
                      {isPrimary && (
                        <View style={[styles.primaryCvBadge, { backgroundColor: colors.secondary }]}>
                          <ThemedText style={styles.primaryCvBadgeText}>CV Chính thức</ThemedText>
                        </View>
                      )}
                    </View>

                    <ThemedText style={styles.resumeMetaText}>
                      {formatFileSize(res.size)} · Tải lên lúc {formatDate(res.createdAt)} ·{' '}
                      <ThemedText
                        style={{
                          fontWeight: '700',
                          color: isReady ? '#047857' : colors.warning,
                        }}
                      >
                        {isReady ? 'Sẵn sàng phân tích' : res.status}
                      </ThemedText>
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.resumeActionsRow}>
                  {!isPrimary ? (
                    <TouchableScale
                      style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                      onPress={() => setPrimaryResumeMutation.mutate(res.id)}
                      disabled={setPrimaryResumeMutation.isPending || !isReady}
                    >
                      <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                        Đặt làm CV chính
                      </ThemedText>
                    </TouchableScale>
                  ) : (
                    <TouchableScale
                      style={[styles.btnGhost, styles.btnSmall]}
                      onPress={() => setPrimaryResumeMutation.mutate(null)}
                      disabled={setPrimaryResumeMutation.isPending}
                    >
                      <ThemedText style={[styles.btnText, { color: colors.danger, fontSize: 11 }]}>
                        Bỏ chọn CV chính
                      </ThemedText>
                    </TouchableScale>
                  )}

                  <TouchableScale
                    style={[styles.btnPrimary, styles.btnSmall, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(app)/resumes' as any)}
                  >
                    <Ionicons name="bar-chart-outline" size={13} color="#ffffff" />
                    <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 11 }}>
                      Quét phân tích
                    </ThemedText>
                  </TouchableScale>

                  <TouchableScale
                    style={[styles.btnGhost, styles.btnSmall]}
                    onPress={() => handleDeleteResumePrompt(res.id, res.fileName)}
                    disabled={deleteResumeMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                    <ThemedText style={[styles.btnText, { color: colors.textMuted, fontSize: 11 }]}>
                      Xóa
                    </ThemedText>
                  </TouchableScale>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </GlassCard>
  );
};
