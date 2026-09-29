import React, { useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/account.styles';
import { toast } from '@/components/ui/toast/ToastProvider';

export const PrivacyDataCard = ({ currentUserData, colors }: { currentUserData: any; colors: any }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    let fileUriToCleanUp: string | null = null;
    try {
      setIsExporting(true);
      const data = await userApi.exportData();
      
      const fileName = `Nexora_Export_${currentUserData?.email || 'Data'}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      fileUriToCleanUp = fileUri;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Xuất Dữ Liệu Cá Nhân Nexora',
        });
      } else {
        toast.success(`Thiết bị không hỗ trợ chia sẻ. Tệp dữ liệu cá nhân đã được lưu tạm tại: ${fileUri}`);
        fileUriToCleanUp = null;
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể trích xuất dữ liệu.');
    } finally {
      setIsExporting(false);
      if (fileUriToCleanUp) {
        FileSystem.deleteAsync(fileUriToCleanUp, { idempotent: true }).catch(() => {});
      }
    }
  };

  return (
    <GlassCard style={styles.card}>
      <View>
        <ThemedText style={styles.cardTitle}>Dữ liệu & Quyền riêng tư</ThemedText>
        <ThemedText style={styles.cardSubtitle}>
          Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình trên hệ thống Nexora.
        </ThemedText>
      </View>

      <View style={[styles.downloadBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
        <View style={styles.downloadBoxHeader}>
          <Ionicons name="download-outline" size={18} color={colors.primary} />
          <ThemedText style={styles.downloadBoxTitle}>Tải xuống bản sao dữ liệu cá nhân</ThemedText>
        </View>
        <ThemedText style={styles.downloadBoxSub}>
          Tệp xuất khẩu chứa toàn bộ thông tin tài khoản, lịch sử thực hành phỏng vấn, hồ sơ mục tiêu và dữ liệu liên quan ở định dạng JSON tiêu chuẩn.
        </ThemedText>
        <ThemedText style={[styles.downloadBoxSub, { color: '#b91c1c', fontWeight: 'bold', marginTop: 4 }]}>
          Tệp chứa toàn bộ dữ liệu cá nhân của bạn. Hãy lưu trữ ở nơi an toàn.
        </ThemedText>
        <TouchableScale
          style={[
            styles.btnOutline,
            { borderColor: colors.cardBorder, backgroundColor: colors.surface, alignSelf: 'flex-start' },
            isExporting && { opacity: 0.6 },
          ]}
          onPress={handleExportData}
          disabled={isExporting}
        >
          {isExporting ? <ActivityIndicator size="small" color={colors.text} /> : null}
          <ThemedText style={[styles.btnText, { color: colors.text }]}>
            Xuất dữ liệu của tôi
          </ThemedText>
        </TouchableScale>
      </View>
    </GlassCard>
  );
};
