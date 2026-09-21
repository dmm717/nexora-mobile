import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type InterviewPresenceState = 'idle' | 'speaking' | 'listening' | 'thinking';

const PRESENCE_CONFIG: Record<
  InterviewPresenceState,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  idle: {
    label: 'Sẵn sàng cho câu trả lời của bạn',
    color: '#6366f1', // Indigo
    icon: 'sparkles',
  },
  speaking: {
    label: 'AI đang đọc câu hỏi...',
    color: '#3b82f6', // Blue
    icon: 'volume-high',
  },
  listening: {
    label: 'Đang lắng nghe bạn trả lời...',
    color: '#10b981', // Emerald
    icon: 'mic',
  },
  thinking: {
    label: 'Nexora AI đang đánh giá & chấm điểm...',
    color: '#f59e0b', // Amber
    icon: 'analytics',
  },
};

export interface AiInterviewerPresenceProps {
  state: InterviewPresenceState;
  interviewerName?: string;
  roleLabel?: string;
  colors: any;
}

export function AiInterviewerPresence({
  state,
  interviewerName = 'Nexora AI',
  roleLabel = 'Người phỏng vấn của bạn',
  colors,
}: AiInterviewerPresenceProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = PRESENCE_CONFIG[state] || PRESENCE_CONFIG.idle;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (state === 'speaking' || state === 'listening' || state === 'thinking') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      animation?.stop();
    };
  }, [state, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Orb Center Container */}
      <View style={styles.orbWrapper}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: config.color,
              opacity: 0.2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={[styles.orbCenter, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={28} color="#ffffff" />
        </View>
      </View>

      {/* Identity & Status */}
      <ThemedText type="title" style={styles.nameText}>
        {interviewerName}
      </ThemedText>
      <ThemedText style={[styles.roleText, { color: colors.icon }]}>
        {roleLabel}
      </ThemedText>

      {/* Dynamic Status Badge */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: colors.card,
            borderColor: config.color,
          },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        <ThemedText style={[styles.statusText, { color: colors.text }]}>
          {config.label}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  orbWrapper: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  orbCenter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  roleText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: Spacing.one,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
