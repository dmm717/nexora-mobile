import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/account.styles';
import { AccountDeletionModal } from './AccountDeletionModal';
import { useAuth } from '@/context/auth-context';

export const DangerZoneCard = ({ logout, colors }: { logout: () => void, colors: any }) => {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const { user } = useAuth();
  const userEmail = user?.email || user?.id || '';

  const handleDeleteAccount = () => {
    setModalVisible(true);
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
          Vô hiệu hóa tài khoản của bạn ngay lập tức. Bạn có 30 ngày ân hạn để khôi phục trước khi dữ liệu bị xóa vĩnh viễn.
        </ThemedText>
      </View>

      <TouchableScale
        style={[styles.btnDanger, { backgroundColor: '#dc2626', alignSelf: 'flex-start' }]}
        onPress={handleDeleteAccount}
      >
        <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
          Xóa tài khoản vĩnh viễn
        </ThemedText>
      </TouchableScale>

      <AccountDeletionModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        logout={logout} 
        colors={colors}
        userEmail={userEmail}
      />
    </View>
    </>
  );
};
