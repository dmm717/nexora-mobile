import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  /** Optional input field label text */
  label?: string;
  /** Optional error text to display below the input field */
  error?: string;
  /** Style for outer container View */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for input container View */
  inputContainerStyle?: StyleProp<ViewStyle>;
  /** Style for inner TextInput element */
  inputStyle?: StyleProp<TextStyle>;
}

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(({
  label,
  error,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  value,
  onChangeText,
  placeholder = '••••••••',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.cardBorder,
          },
          inputContainerStyle,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, { color: colors.text }, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeIconButton}
          accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      {error ? <ThemedText style={[styles.errorText, { color: colors.danger }]}>{error}</ThemedText> : null}
    </View>
  );
});

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeIconButton: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
});
