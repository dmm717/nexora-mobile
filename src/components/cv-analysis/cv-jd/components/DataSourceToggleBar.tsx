import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/cv-jd.styles';

export const ToggleItem = React.memo(({
  active,
  title,
  subtitle,
  onPress,
  colorScheme,
  colors,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
  colorScheme: string;
  colors: any;
}) => {
  const activeBg = colorScheme === 'dark' ? '#374151' : '#FFFFFF';
  const activeColor = colorScheme === 'dark' ? colors.primaryLight : colors.primary;
  const textColor = active ? activeColor : colors.text;
  const subColor = active ? activeColor : colors.textSecondary;

  return (
    <TouchableScale
      style={[styles.toggleBtnPremium, active && [styles.toggleBtnActivePremium, { backgroundColor: activeBg }]]}
      onPress={onPress}
    >
      <ThemedText style={[styles.toggleBtnTextPremium, { color: textColor }]}>{title}</ThemedText>
      <ThemedText style={{ fontSize: 10, color: subColor, marginTop: 2 }}>{subtitle}</ThemedText>
    </TouchableScale>
  );
});

export const DataSourceToggleBar = React.memo(({
  useCurrentProfile,
  setUseCurrentProfile,
  mode,
  setMode,
  colorScheme,
  colors,
}: {
  useCurrentProfile: boolean;
  setUseCurrentProfile: (v: boolean) => void;
  mode: string;
  setMode: (m: any) => void;
  colorScheme: string;
  colors: any;
}) => {
  const onSelectCurrent = () => {
    setUseCurrentProfile(true);
    if (mode === 'field_benchmark') setMode('standard');
  };

  const onSelectCustom = () => {
    setUseCurrentProfile(false);
    if (mode === 'standard') setMode('field_benchmark');
  };

  return (
    <View style={styles.dataSourceContainerPremium}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary }]}>NGUỒN DỮ LIỆU PHÂN TÍCH</ThemedText>
      <View style={[styles.toggleWrapPremium, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <ToggleItem
          active={useCurrentProfile}
          title="Dùng hồ sơ hiện tại"
          subtitle="CV chính + mục tiêu nghề nghiệp"
          onPress={onSelectCurrent}
          colorScheme={colorScheme}
          colors={colors}
        />
        <ToggleItem
          active={!useCurrentProfile}
          title="Tùy chỉnh lần phân tích"
          subtitle="CV+mục tiêu riêng cho lần này"
          onPress={onSelectCustom}
          colorScheme={colorScheme}
          colors={colors}
        />
      </View>
    </View>
  );
});
