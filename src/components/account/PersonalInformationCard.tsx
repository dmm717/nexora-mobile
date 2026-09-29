import React, { useEffect, useState } from 'react';
import { View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '@/services/logger';

import { toast } from '@/components/ui/toast/ToastProvider';
import { userApi } from '@/api/user.api';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/account.styles';

import { useAuth } from '@/context/auth-context';

export const PersonalInformationCard = ({ currentUserData, colors }: { currentUserData: any; colors: any }) => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  useEffect(() => {
    if (currentUserData) {
      setDisplayName(currentUserData.displayName || '');
      setYearsOfExperience(
        currentUserData.yearsOfExperience != null
          ? String(currentUserData.yearsOfExperience)
          : ''
      );
    }
  }, [currentUserData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName?: string; yearsOfExperience?: number | null }) =>
      userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      void refreshUser();
      toast.success('Cập nhật thông tin cá nhân thành công!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể cập nhật thông tin cá nhân.');
    },
  });

  const handleSavePersonalInfo = () => {
    const parsedYoe = yearsOfExperience.trim() !== '' ? parseInt(yearsOfExperience, 10) : null;
    updateProfileMutation.mutate({
      displayName: displayName.trim(),
      yearsOfExperience: parsedYoe,
    });
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        
        if (asset.uri) {
          const mimeType = asset.mimeType || 'image/jpeg';
          const filename = asset.fileName || `avatar_${Date.now()}.jpg`;
          
          const MAX_FILE_SIZE = 5 * 1024 * 1024;
          let currentUri = asset.uri;

          try {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
              toast.error('Chỉ hỗ trợ định dạng ảnh JPEG, PNG hoặc WebP.');
              setIsUploadingAvatar(false);
              try { if (currentUri) await FileSystem.deleteAsync(currentUri, { idempotent: true }); } catch (err: any) { logger.warn('Cleanup failed', { error: err?.message || err }); }
              return;
            }

            const response = await fetch(currentUri);
            const blob = await response.blob();
            const size = blob.size;

            if (size > MAX_FILE_SIZE) {
              toast.error('Kích thước ảnh không được vượt quá 5MB.');
              setIsUploadingAvatar(false);
              try { if (currentUri) await FileSystem.deleteAsync(currentUri, { idempotent: true }); } catch (err: any) { logger.warn('Cleanup failed', { error: err?.message || err }); }
              return;
            }

            await userApi.uploadAvatar(currentUri, mimeType, filename);
            
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['career-profile'] });
            await refreshUser();
            toast.success('Đã cập nhật ảnh đại diện.');
          } finally {
            try {
              if (currentUri) {
                await FileSystem.deleteAsync(currentUri, { idempotent: true });
              }
            } catch (err: any) { logger.warn('Failed to delete temp avatar file', { error: err?.message || err }); }
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa ảnh đại diện?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsUploadingAvatar(true);
            await userApi.deleteAvatar();
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['career-profile'] });
            await refreshUser();
            toast.success('Đã xóa ảnh đại diện.');
          } catch (err: any) {
            toast.error(err?.message || 'Không thể xóa ảnh.');
          } finally {
            setIsUploadingAvatar(false);
          }
        }
      }
    ]);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.avatarSection, { borderBottomColor: colors.cardBorder }]}>
        <View>
          <UserAvatar 
            name={displayName} 
            email={currentUserData?.email} 
            avatarUrl={currentUserData?.avatarUrl}
            size={54} 
          />
          {isUploadingAvatar && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 27, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText style={styles.fieldLabel}>Ảnh đại diện</ThemedText>
          <View style={styles.avatarActionsRow}>
            <TouchableScale
              style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                Thay ảnh
              </ThemedText>
            </TouchableScale>
            <TouchableScale
              style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
              onPress={handleDeleteAvatar}
              disabled={isUploadingAvatar || !currentUserData?.avatarUrl}
            >
              <ThemedText style={[styles.btnText, { color: colors.textMuted, fontSize: 11 }]}>
                Xóa ảnh
              </ThemedText>
            </TouchableScale>
          </View>
          <ThemedText style={styles.avatarSubtext}>
            JPEG, PNG hoặc WebP · tối đa 5 MB
          </ThemedText>
        </View>
      </View>

      <View style={{ gap: Spacing.three, marginTop: Spacing.one }}>
        <View>
          <ThemedText style={styles.cardTitle}>Thông tin cá nhân</ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Cập nhật tên hiển thị và số năm kinh nghiệm để cá nhân hóa lộ trình của bạn.
          </ThemedText>
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.fieldLabel}>Tên hiển thị</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                color: colors.text,
              },
            ]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Ví dụ: Nguyễn Văn A"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.fieldLabel}>Địa chỉ Email</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
                color: colors.textMuted,
              },
            ]}
            value={currentUserData?.email || ''}
            editable={false}
          />
          <View style={styles.fieldNoteRow}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
            <ThemedText style={styles.fieldNoteText}>
              Email được định danh theo tài khoản và không thể chỉnh sửa tại đây.
            </ThemedText>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.fieldLabel}>Số năm kinh nghiệm làm việc</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                color: colors.text,
              },
            ]}
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
            placeholder="Ví dụ: 3"
            placeholderTextColor={colors.textMuted}
          />
          <ThemedText style={styles.fieldNoteText}>
            Nhập từ 0 đến 60. Để trống sẽ giữ nguyên giá trị hiện có (không hỗ trợ xóa trắng sau khi đã lưu).
          </ThemedText>
        </View>

        <TouchableScale
          style={[
            styles.btnPrimary,
            { backgroundColor: colors.primary, marginTop: 4 },
            updateProfileMutation.isPending && { opacity: 0.6 },
          ]}
          onPress={handleSavePersonalInfo}
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : null}
          <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
            Lưu thay đổi
          </ThemedText>
        </TouchableScale>
      </View>
    </GlassCard>
  );
};
