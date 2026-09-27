import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Typography } from '@/constants/theme';
import { styles } from '@/styles/cv-jd.styles';
import { getFileIconProps } from '../useCvJdTabState';

export const PrimaryCvSpotlightCard = React.memo(({
  profile,
  colorScheme,
  colors,
}: {
  profile: any;
  colorScheme: string;
  colors: any;
}) => {
  const fileProps = getFileIconProps(profile?.primaryResume?.fileName);
  return (
    <View style={[styles.contextCardPremium, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)' }]}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary, marginBottom: 12 }]}>BỐI CẢNH ĐÃ SẴN SÀNG</ThemedText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{
          width: 68,
          height: 90,
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'visible'
        }}>
          <View style={{ height: 16, backgroundColor: fileProps.color, borderTopLeftRadius: 5, borderTopRightRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
            <ThemedText style={{ color: '#FFF', fontSize: 7, fontFamily: Typography.fontFamily.bold, letterSpacing: 0.5 }}>{fileProps.label}</ThemedText>
          </View>
          <View style={{ padding: 8, gap: 5 }}>
            <View style={{ height: 3, width: '60%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : '#E5E7EB', borderRadius: 2 }} />
            <View style={{ height: 3, width: '90%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '80%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '85%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '40%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
          </View>

          <View style={{ position: 'absolute', bottom: -6, right: -6, backgroundColor: '#10B981', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF', boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.3)' }}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          <View>
            <ThemedText style={styles.contextItemLabelPremium}>CV chính:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>{profile?.primaryResume?.fileName || 'Chưa thiết lập'}</ThemedText>
          </View>

          <View style={[styles.contextDivider, { marginVertical: 0, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

          <View>
            <ThemedText style={styles.contextItemLabelPremium}>Mục tiêu nghề nghiệp:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>
              {profile?.activeCareerGoal?.targetRole || 'Chưa thiết lập'}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});
