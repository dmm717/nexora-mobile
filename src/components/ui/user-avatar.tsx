import React from 'react';
import { StyleSheet, View, Image, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getAvatarColor } from '@/utils/career-goal-contract';

export interface UserAvatarProps {
  /** Display name of the user */
  name?: string | null;
  /** Email address of the user */
  email?: string | null;
  /** Remote image URL for avatar */
  avatarUrl?: string | null;
  /** Diameter of the avatar. Defaults to 40 */
  size?: number;
  /** Outer container style override */
  style?: StyleProp<ImageStyle>;
  /** Text style override for letter fallback */
  textStyle?: StyleProp<TextStyle>;
}

export const UserAvatar = React.memo<UserAvatarProps>(({
  name,
  email,
  avatarUrl,
  size = 40,
  style,
  textStyle,
}) => {
  const displayName = name || email || 'N';
  const char = displayName.charAt(0).toUpperCase();
  const backgroundColor = getAvatarColor(email || name || 'user');
  const fontSize = Math.round(size * 0.42);

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[
          styles.avatarImage,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style as StyleProp<ViewStyle>,
      ]}
    >
      <ThemedText
        style={[
          styles.avatarText,
          { fontSize },
          textStyle,
        ]}
      >
        {char}
      </ThemedText>
    </View>
  );
});

UserAvatar.displayName = 'UserAvatar';

const styles = StyleSheet.create({
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
