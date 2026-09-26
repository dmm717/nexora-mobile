import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Pressable } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius } from '@/constants/theme';

interface MaterialInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: string;
}

export const MaterialInput: React.FC<MaterialInputProps> = ({
  label,
  error,
  value,
  isPassword = false,
  leftIcon,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // Animation values
  const focusAnim = useSharedValue(value ? 1 : 0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.set(withTiming(1, { duration: 200 }));
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      focusAnim.set(withTiming(0, { duration: 200 }));
    }
    onBlur?.(e);
  };

  // Label animation style
  const animatedLabelStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(focusAnim.value, [0, 1], [
      colors.textSecondary,
      error ? colors.error : (isFocused ? colors.primary : colors.textSecondary)
    ]);
    
    return {
      color: textColor,
      transform: [
        { translateY: interpolate(focusAnim.value, [0, 1], [0, -27]) },
        { scale: interpolate(focusAnim.value, [0, 1], [1, 0.85]) },
        { translateX: interpolate(focusAnim.value, [0, 1], [0, leftIcon ? 20 : -6]) }
      ]
    };
  });

  // Border animation style
  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(focusAnim.value, [0, 1], [
      colors.border,
      error ? colors.error : (isFocused ? colors.primary : colors.border)
    ]);
    return {
      borderColor,
      borderWidth: interpolate(focusAnim.value, [0, 1], [1, 2])
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, animatedContainerStyle, { backgroundColor: colors.surface }]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <Animated.Text
          style={[
            styles.label,
            animatedLabelStyle,
            {
              backgroundColor: colors.surface,
              left: leftIcon ? 42 : 14,
              pointerEvents: 'none',
            },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          placeholderTextColor="transparent"
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={12}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </Animated.View>
      {error ? (
        <Animated.Text style={[styles.errorText, { color: colors.error }]}>{error}</Animated.Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  inputContainer: {
    height: 56,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  leftIcon: {
    marginRight: 10,
  },
  label: {
    position: 'absolute',
    top: 17,
    fontSize: 15,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    zIndex: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
