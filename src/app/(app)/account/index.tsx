import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/context/auth-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { ProductFeedbackCard } from '@/components/profile/ProductFeedbackCard';
import { PlanUsageStatsGrid } from '@/components/profile/plan-usage-stats-grid';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';
import { PasswordInput } from '@/components/ui/password-input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { safeBack } from '@/utils/navigation';
import { getAvatarColor, formatDate } from '@/utils/career-goal-contract';
import { formatCurrency, getOrderStatusPresentation } from '@/utils/billing-presentation';
import { styles } from '@/styles/account.styles';

export default function AccountScreen() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

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
      setDisplayName(currentUserData.displayName || currentUserData.fullName || '');
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

  // Export Data
  const [isExporting, setIsExporting] = useState(false);
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await userApi.exportData();
      Alert.alert(
        'Xuất Dữ Liệu Thành Công',
        `Tệp dữ liệu cá nhân JSON đã được trích xuất thành công cho tài khoản ${currentUserData?.email}.`
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể trích xuất dữ liệu.');
    } finally {
      setIsExporting(false);
    }
  };

  // Delete Account Request
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.requestDeletion(),
    onSuccess: () => {
      Alert.alert(
        'Đã Gửi Yêu Cầu Xóa',
        'Yêu cầu xóa tài khoản người dùng đã được tiếp nhận. Bạn sẽ được đăng xuất.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể yêu cầu xóa tài khoản.');
    },
  });

  const handleDeleteAccountPrompt = () => {
    Alert.alert(
      'Yêu Cầu Xóa Tài Khoản',
      'Bạn có chắc chắn muốn bắt đầu quy trình xóa tài khoản không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận xóa',
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
              <UserAvatar name={displayName} email={currentUserData?.email} size={54} />

              <View style={{ flex: 1, gap: 4 }}>
                <ThemedText style={styles.fieldLabel}>Ảnh đại diện</ThemedText>
                <View style={styles.avatarActionsRow}>
                  <TouchableScale
                    style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                    onPress={() => Alert.alert('Thông báo', 'Chọn ảnh đại diện mới từ thư viện ảnh.')}
                  >
                    <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                      Thay ảnh
                    </ThemedText>
                  </TouchableScale>
                  <TouchableScale
                    style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                    onPress={() => Alert.alert('Thông báo', 'Đã gỡ ảnh đại diện.')}
                  >
                    <ThemedText style={[styles.btnText, { color: colors.textMuted, fontSize: 11 }]}>
                      Xóa ảnh
                    </ThemedText>
                  </TouchableScale>
                </View>
                <ThemedText style={styles.avatarSubtext}>
                  JPEG, PNG hoặc WebP · tối đa 2 MB
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

          {/* CARD 7: KHU VỰC NGUY HIỂM (DangerZoneCard) */}
          <View style={[styles.dangerZoneContainer, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={styles.dangerHeaderRow}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <ThemedText style={[styles.dangerTitle, { color: '#dc2626' }]}>
                Khu vực nguy hiểm
              </ThemedText>
            </View>

            <View style={{ gap: 4 }}>
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#991b1b' }}>
                Yêu cầu xóa tài khoản người dùng
              </ThemedText>
              <ThemedText style={[styles.dangerSub, { color: '#7f1d1d' }]}>
                Bắt đầu quy trình xóa tài khoản. Sau khi yêu cầu được chấp nhận, bạn sẽ được đăng xuất khỏi phiên hiện tại.
              </ThemedText>
            </View>

            <TouchableScale
              style={[styles.btnDanger, { backgroundColor: '#dc2626', alignSelf: 'flex-start' }]}
              onPress={handleDeleteAccountPrompt}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : null}
              <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
                Yêu cầu xóa tài khoản
              </ThemedText>
            </TouchableScale>
          </View>
        </ScrollView>
        <AppBottomNavBar activeTab="profile" />
      </SafeAreaView>
    </ThemedView>
  );
}
