import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/account.styles';
import { AccountDeletionModal } from './AccountDeletionModal';
import { useAuth } from '@/context/auth-context';

export const DangerZoneCard = ({ colors }: { colors: any }) => {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const { user, clearSession } = useAuth();
  const userEmail = user?.email || '';

  const handleDeleteAccount = () => {
    if (user) setModalVisible(true);
  };

  return (
    <>
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
          Gửi yêu cầu xóa tài khoản và dữ liệu cá nhân. Khi máy chủ chấp nhận, bạn sẽ được đăng xuất. Không có chức năng hủy yêu cầu trong ứng dụng.
        </ThemedText>
      </View>

      <TouchableScale
        style={[styles.btnDanger, { backgroundColor: '#dc2626', alignSelf: 'flex-start' }]}
        onPress={handleDeleteAccount}
      >
        <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
          Yêu cầu xóa tài khoản
        </ThemedText>
      </TouchableScale>

      <AccountDeletionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        logout={clearSession}
        colors={colors}
        userEmail={userEmail}
      />
    </View>
    </>
  );
};
