import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface MaterialInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const MaterialInput: React.FC<MaterialInputProps> = ({
  label,
  error,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const isDark = themeKey === 'dark';
  
  // Animation values
  const focusAnim = useSharedValue(value ? 1 : 0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      focusAnim.value = withTiming(0, { duration: 200 });
    }
    if (onBlur) onBlur(e);
  };

  // Label animation style
  const animatedLabelStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(focusAnim.value, [0, 1], [
      colors.textSecondary,
      error ? '#FF3B30' : (isFocused ? '#3525CD' : colors.textSecondary)
    ]);
    
    return {
      color: textColor,
      transform: [
        { translateY: interpolate(focusAnim.value, [0, 1], [0, -27]) },
        { scale: interpolate(focusAnim.value, [0, 1], [1, 0.85]) },
        { translateX: interpolate(focusAnim.value, [0, 1], [0, -6]) }
      ]
    };
  });

  // Border animation style
  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(focusAnim.value, [0, 1], [
      colors.backgroundSelected,
      error ? '#FF3B30' : (isFocused ? '#3525CD' : colors.backgroundSelected)
    ]);
    return {
      borderColor,
      borderWidth: interpolate(focusAnim.value, [0, 1], [1, 2])
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, animatedContainerStyle, { backgroundColor: colors.backgroundElement }]}>
        <Animated.Text style={[styles.label, animatedLabelStyle, { backgroundColor: colors.backgroundElement }]}>
          {label}
        </Animated.Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          placeholderTextColor="transparent"
          {...props}
        />
      </Animated.View>
      {error ? (
        <Animated.Text style={styles.errorText}>{error}</Animated.Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  inputContainer: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 14,
    top: 17,
    fontSize: 16,
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
