import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

import { userApi } from '@/api/user.api';
import { resumesApi } from '@/api/resumes.api';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { ProductFeedbackCard } from '@/components/profile/ProductFeedbackCard';
import { PlanUsageStatsGrid } from '@/components/profile/plan-usage-stats-grid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { LegalPolicyModal, PolicyTab } from '@/components/ui/legal-policy-modal';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import { PasswordInput } from '@/components/ui/password-input';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/account.styles';
import { formatCurrency } from '@/utils/billing-presentation';
import { formatDate } from '@/utils/career-goal-contract';


export default function AccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openLegal?: string; tab?: string }>();
  const { user: authUser, logout } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

  // Legal Modal State
  const [isLegalModalVisible, setIsLegalModalVisible] = useState(params.openLegal === 'true');
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>((params.tab as PolicyTab) || 'privacy');

  useEffect(() => {
    if (params.openLegal === 'true') {
      setIsLegalModalVisible(true);
      if (params.tab) {
        setLegalModalTab(params.tab as PolicyTab);
      }
    }
  }, [params.openLegal, params.tab]);

  const openLegalModal = (tab: PolicyTab) => {
    setLegalModalTab(tab);
    setIsLegalModalVisible(true);
  };

  // 1. Fetch Current User (canonical profile, entitlement & orders)
  const {
    data: user,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userApi.getCurrentUser,
    enabled: !!authUser,
  });

  const currentUserData = user || authUser;

  // Form State 1: Personal Info
  const [displayName, setDisplayName] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  useEffect(() => {
    if (currentUserData) {
      setDisplayName(currentUserData.displayName || currentUserData.displayName || '');
      setYearsOfExperience(
        (currentUserData as any).yearsOfExperience != null
          ? String((currentUserData as any).yearsOfExperience)
          : ''
      );
    }
  }, [currentUserData]);

  // Form State 2: Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- MUTATIONS ---

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName?: string; yearsOfExperience?: number | null }) =>
      userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công!');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật thông tin cá nhân.');
    },
  });

  const handleSavePersonalInfo = () => {
    const parsedYoe = yearsOfExperience.trim() !== '' ? parseInt(yearsOfExperience, 10) : null;
    updateProfileMutation.mutate({
      displayName: displayName.trim(),
      yearsOfExperience: parsedYoe,
    });
  };

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
    onSuccess: () => {
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Lỗi khi đổi mật khẩu.');
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu mới yêu cầu tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Xác nhận mật khẩu mới không khớp.');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  // Avatar Management
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
        
        // Ensure uri and mimetype exist
        if (asset.uri) {
          const mimeType = asset.mimeType || 'image/jpeg';
          const filename = asset.fileName || `avatar_${Date.now()}.jpg`;
          
          // SECURITY & VALIDATION (Phase 4.8): Strict size limit (5MB)
          const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
          let currentUri = asset.uri;

          try {
            // SECURITY & VALIDATION (Phase 4.8): Strict type limit (JPEG/PNG/WebP only)
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
              Alert.alert('Lỗi', 'Chỉ hỗ trợ định dạng ảnh JPEG, PNG hoặc WebP.');
              setIsUploadingAvatar(false);
              try { if (currentUri) await FileSystem.deleteAsync(currentUri, { idempotent: true }); } catch {}
              return;
            }

            // 1. Get raw bytes and size
            const response = await fetch(currentUri);
            const blob = await response.blob();
            const size = blob.size;

            if (size > MAX_FILE_SIZE) {
              Alert.alert('Lỗi', 'Kích thước ảnh không được vượt quá 5MB.');
              setIsUploadingAvatar(false);
              // Clean up cache
              try { if (currentUri) await FileSystem.deleteAsync(currentUri, { idempotent: true }); } catch {}
              return;
            }

            // 2. Request presigned URL
            const intent = await resumesApi.presign({
              fileName: filename,
              contentType: mimeType,
              size,
            });

            // 3. Upload to S3
            await resumesApi.uploadRawBytes(intent.uploadUrl, blob, mimeType);

            // 4. Update avatar in backend
            await userApi.uploadAvatar(intent.token);
            
            // Use the exact queryKey used in the useQuery hook above
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['career-profile'] });
            Alert.alert('Thành Công', 'Đã cập nhật ảnh đại diện.');
          } finally {
            // SECURITY & PERFORMANCE (Phase 4.8): Always clean up ImagePicker temp cache
            try {
              if (currentUri) {
                await FileSystem.deleteAsync(currentUri, { idempotent: true });
              }
            } catch (err) {
              // Ignore silent cleanup errors
            }
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
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
            Alert.alert('Thành Công', 'Đã xóa ảnh đại diện.');
          } catch (err: any) {
            Alert.alert('Lỗi', err?.message || 'Không thể xóa ảnh.');
          } finally {
            setIsUploadingAvatar(false);
          }
        }
      }
    ]);
  };

  // Export Data
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
        // Deletion is handled in the finally block
      } else {
        Alert.alert(
          'Thành Công',
          `Thiết bị không hỗ trợ chia sẻ. Tệp dữ liệu cá nhân đã được lưu tạm tại: ${fileUri}`
        );
        fileUriToCleanUp = null; // Leave it for the user to potentially access
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể trích xuất dữ liệu.');
    } finally {
      setIsExporting(false);
      if (fileUriToCleanUp) {
        FileSystem.deleteAsync(fileUriToCleanUp, { idempotent: true }).catch(() => {});
      }
    }
  };

  // Delete Account Request
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      Alert.alert(
        'Đã Xóa Tài Khoản',
        'Tài khoản của bạn đã được xóa vĩnh viễn khỏi hệ thống.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.');
    },
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      'XÓA TÀI KHOẢN VĨNH VIỄN',
      'Hành động này không thể hoàn tác.\n\nToàn bộ dữ liệu, lịch sử phỏng vấn, và gói đăng ký PRO (nếu có) sẽ bị xóa NGAY LẬP TỨC. Bạn có chắc chắn muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa Vĩnh Viễn',
          style: 'destructive',
          onPress: () => deleteAccountMutation.mutate(),
        },
      ]
    );
  };



  // Entitlement & Orders
  const billing = (currentUserData as any)?.billing;
  const entitlement = billing?.entitlement;
  const orders = billing?.orders || [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Header Bar */}
        <AppScreenHeader title="Cài Đặt Tài Khoản" fallbackRoute="/(tabs)/profile" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
        >
          {/* HERO HEADER BLOCK (AccountHeader) */}
          <View style={styles.heroBlock}>
            <ThemedText style={[styles.topLabelText, { color: colors.primary }]}>
              TÀI KHOẢN & BẢO MẬT
            </ThemedText>

            <ThemedText style={styles.mainHeading}>Cài đặt tài khoản</ThemedText>

            <ThemedText style={styles.subHeading}>
              Quản lý thông tin cá nhân, bảo mật, gói sử dụng và quyền riêng tư.
            </ThemedText>

            <TouchableScale
              style={styles.linkBtn}
              onPress={() => router.push('/(app)/career-profile' as any)}
            >
              <ThemedText style={[styles.linkBtnText, { color: colors.primary }]}>
                → Quản lý CV & Mục tiêu nghề nghiệp trong Hồ sơ nghề nghiệp
              </ThemedText>
            </TouchableScale>
          </View>

          {/* CARD 1: THÔNG TIN CÁ NHÂN (PersonalInformationCard) */}
          <GlassCard style={styles.card}>
            {/* Sub-section: Ảnh đại diện */}
            <View style={[styles.avatarSection, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <UserAvatar 
                  name={displayName} 
                  email={currentUserData?.email} 
                  avatarUrl={currentUserData?.avatarUrl}
                  size={54} 
                />
                {isUploadingAvatar && (
                  <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 27, justifyContent: 'center', alignItems: 'center' }]}>
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

            {/* Sub-section: Thông tin cá nhân */}
            <View style={{ gap: Spacing.three, marginTop: Spacing.one }}>
              <View>
                <ThemedText style={styles.cardTitle}>Thông tin cá nhân</ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Cập nhật tên hiển thị và số năm kinh nghiệm để cá nhân hóa lộ trình của bạn.
                </ThemedText>
              </View>

              {/* Tên hiển thị */}
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

              {/* Email (Read-Only) */}
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

              {/* Số năm kinh nghiệm làm việc */}
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

              {/* Save Button */}
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

          {/* CARD 2: BẢO MẬT MẬT KHẨU (SecurityCard) */}
          <GlassCard style={styles.card}>
            <View>
              <ThemedText style={styles.cardTitle}>Bảo mật mật khẩu</ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Đổi mật khẩu định kỳ để bảo vệ tài khoản. Mật khẩu mới yêu cầu tối thiểu 8 ký tự.
              </ThemedText>
            </View>

            {/* Mật khẩu hiện tại */}
            <PasswordInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
            />

            {/* Mật khẩu mới */}
            <PasswordInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Tối thiểu 8 ký tự"
            />

            {/* Xác nhận mật khẩu mới */}
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
            />

            {/* Change Password Button */}
            <TouchableScale
              style={[
                styles.btnPrimary,
                { backgroundColor: colors.primary, marginTop: 4 },
                changePasswordMutation.isPending && { opacity: 0.6 },
              ]}
              onPress={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : null}
              <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
                Đổi mật khẩu
              </ThemedText>
            </TouchableScale>
          </GlassCard>

          {/* CARD 3: GÓI CƯỚC & SỬ DỤNG (PlanUsageCard) */}
          <GlassCard style={styles.card}>
            <View style={styles.planHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ThemedText style={styles.cardTitle}>Gói cước & Sử dụng</ThemedText>
                  <View style={[styles.planBadge, { backgroundColor: colors.primaryLight }]}>
                    <ThemedText style={[styles.planBadgeText, { color: colors.primary }]}>
                      {entitlement?.planCode || 'FREE'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.cardSubtitle}>
                  Thông tin quyền lợi và hạn mức sử dụng tính năng AI của tài khoản.
                </ThemedText>
              </View>

              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
                onPress={() => router.push('/(app)/pricing' as any)}
              >
                <ThemedText style={[styles.btnText, { color: colors.text }]}>Nâng cấp gói</ThemedText>
              </TouchableScale>
            </View>

            {/* 4 Usage Metrics Grid */}
            <PlanUsageStatsGrid
              startsAt={entitlement?.startsAt}
              endsAt={entitlement?.endsAt}
              consumed={entitlement?.consumed}
              limit={entitlement?.limit}
              available={entitlement?.available}
            />

            {/* Orders History Sub-section */}
            {orders.length > 0 && (
              <View style={[styles.ordersSection, { borderTopColor: colors.cardBorder }]}>
                <ThemedText style={styles.ordersTitle}>Lịch sử giao dịch</ThemedText>
                {orders.map((o: any) => (
                  <View
                    key={o.id}
                    style={[
                      styles.orderCardItem,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ThemedText style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: 12, color: colors.primary }}>
                        #{o.id.slice(-6).toUpperCase()}
                      </ThemedText>
                      <OrderStatusBadge status={o.status} size="sm" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>
                        {o.planCode} · {formatDate(o.createdAt)}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, fontWeight: '800' }}>
                        {formatCurrency(o.amountMinor, o.currency)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>

          {/* CARD 4: DỮ LIỆU & QUYỀN RIÊNG TƯ (PrivacyDataCard) */}
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

          {/* CARD 5: ĐÁNH GIÁ & GÓP Ý (ProductFeedbackCard) */}
          <ProductFeedbackCard />

          {/* CARD 6: PHIÊN ĐĂNG NHẬP (SessionsCard) */}
          <GlassCard style={styles.card}>
            <View>
              <ThemedText style={styles.cardTitle}>Phiên đăng nhập</ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Quản lý phiên làm việc hiện tại hoặc kết thúc tất cả phiên đăng nhập khác.
              </ThemedText>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', marginTop: 4 }}>
              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
                onPress={logout}
              >
                <ThemedText style={[styles.btnText, { color: colors.text }]}>
                  Đăng xuất thiết bị này
                </ThemedText>
              </TouchableScale>

              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                onPress={() =>
                  Alert.alert(
                    'Đăng Xuất Tất Cả Thiết Bị',
                    'Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị không?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Đăng xuất tất cả', style: 'destructive', onPress: logout },
                    ]
                  )
                }
              >
                <ThemedText style={[styles.btnText, { color: colors.primary }]}>
                  Đăng xuất khỏi tất cả thiết bị
                </ThemedText>
              </TouchableScale>
            </View>
          </GlassCard>

          {/* CARD 7: PHÁP LÝ & ĐIỀU KHOẢN (LegalComplianceCard - CH Play Compliance) */}
          <GlassCard style={styles.card}>
            <View>
              <ThemedText style={styles.cardTitle}>Pháp lý & Điều khoản</ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Các điều khoản sử dụng, chính sách bảo mật và quyền lợi dữ liệu người dùng.
              </ThemedText>
            </View>

            <View style={{ gap: Spacing.two, marginTop: 4 }}>
              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => openLegalModal('privacy')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                  <ThemedText style={[styles.btnText, { color: colors.text }]}>Chính sách bảo mật</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableScale>

              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => openLegalModal('terms')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  <ThemedText style={[styles.btnText, { color: colors.text }]}>Điều khoản dịch vụ</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableScale>

              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => openLegalModal('payment')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="card-outline" size={18} color={colors.primary} />
                  <ThemedText style={[styles.btnText, { color: colors.text }]}>Chính sách thanh toán & hoàn tiền</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableScale>

              <TouchableScale
                style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => openLegalModal('deletion')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="trash-bin-outline" size={18} color={colors.primary} />
                  <ThemedText style={[styles.btnText, { color: colors.text }]}>Quy trình xóa dữ liệu (Google Play)</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableScale>
            </View>
          </GlassCard>

          {/* CARD 8: KHU VỰC NGUY HIỂM (DangerZoneCard) */}
          <View style={[styles.dangerZoneContainer, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={styles.dangerHeaderRow}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <ThemedText style={[styles.dangerTitle, { color: '#dc2626' }]}>
                Khu vực nguy hiểm
              </ThemedText>
            </View>

            <View style={{ gap: 4 }}>
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#991b1b' }}>
                Xóa tài khoản người dùng
              </ThemedText>
              <ThemedText style={[styles.dangerSub, { color: '#7f1d1d' }]}>
                Xóa vĩnh viễn tài khoản của bạn khỏi hệ thống (bao gồm mọi dữ liệu và gói PRO). Hành động này diễn ra ngay lập tức và không thể hoàn tác.
              </ThemedText>
            </View>

            <TouchableScale
              style={[styles.btnDanger, { backgroundColor: '#dc2626', alignSelf: 'flex-start' }]}
              onPress={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : null}
              <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
                Xóa tài khoản vĩnh viễn
              </ThemedText>
            </TouchableScale>
          </View>
        </ScrollView>
        <AppBottomNavBar activeTab="profile" />

        {/* Legal Policy Modal */}
        <LegalPolicyModal
          visible={isLegalModalVisible}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalVisible(false)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
