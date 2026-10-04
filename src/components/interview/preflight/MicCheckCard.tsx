import React, { memo, useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/interview-preflight.styles';
import { Spacing } from '@/constants/theme';
import * as FileSystem from 'expo-file-system/legacy';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import { logger } from '@/services/logger';

export const MicCheckCard = memo(({ colors, onModeChange }: { colors: any; onModeChange?: (mode: 'voice' | 'text') => void }) => {
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'ready' | 'blocked'>('idle');
  const [meterLevel, setMeterLevel] = useState(0);

  // use expo-audio for real mic test
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  // Map metering to meterLevel when testing
  useEffect(() => {
    if (micStatus === 'testing') {
      const dbfs = recorderState.metering || -160;
      // Normalize -160..0 to 0..100
      let normalized = ((dbfs + 160) / 160) * 100;
      if (normalized < 0) normalized = 0;
      if (normalized > 100) normalized = 100;
      setMeterLevel(Math.floor(normalized));
    } else if (micStatus === 'ready' || micStatus === 'blocked') {
      setMeterLevel(100);
    } else {
      setMeterLevel(0);
    }
  }, [micStatus, recorderState.metering]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        if (recorder.isRecording) {
          recorder.stop().then(() => {
            try {
              if (recorder.uri) {
                FileSystem.deleteAsync(recorder.uri, { idempotent: true }).catch(() => {});
              }
            } catch { /* native object already released */ }
          }).catch(() => {});
        }
      } catch { /* native recorder already destroyed on unmount */ }
    };
  }, [recorder]);

  const handleTest = async () => {
    if (micStatus === 'testing') return;
    setMicStatus('testing');
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          setMicStatus('ready');
          onModeChange?.('voice');
        } else {
          setMicStatus('blocked');
          onModeChange?.('text');
        }
      } else {
        // Native: use expo-audio real permission request and recording
        const perm = await requestRecordingPermissionsAsync();
        if (perm.granted) {
          await recorder.prepareToRecordAsync();
          recorder.record();
          
          // Test for 3 seconds
          timeoutRef.current = setTimeout(async () => {
            try {
              if (recorder.isRecording) {
                await recorder.stop();
              }
              if (recorder.uri) {
                await FileSystem.deleteAsync(recorder.uri, { idempotent: true });
              }
            } catch (err: any) { logger.warn('Failed mic stop', { error: err?.message || err }); }
            setMicStatus('ready');
            onModeChange?.('voice');
          }, 3000);
        } else {
          setMicStatus('blocked');
          onModeChange?.('text');
        }
      }
    } catch (err: any) {
      logger.warn('Failed mic check', { error: err?.message || err });
      setMicStatus('blocked');
      onModeChange?.('text');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, gap: Spacing.three }]}>
      {/* Header Row */}
      <View style={styles.cardHeaderRow}>
        <Ionicons name="mic-outline" size={22} color="#059669" />
        <ThemedText type="subtitle" style={styles.cardTitle}>Kiểm tra thiết bị âm thanh</ThemedText>
      </View>

      {/* Inner Container */}
      <View
        style={{
          backgroundColor: colors.backgroundElement,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          borderRadius: 16,
          padding: 14,
          gap: 12,
        }}
      >
        {/* Status Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
            {micStatus === 'testing' ? '🎤 Đang đo tín hiệu âm thanh...' : 'Tín hiệu Microphone:'}
          </ThemedText>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                micStatus === 'ready'
                  ? '#d1fae5'
                  : micStatus === 'blocked'
                  ? '#fee2e2'
                  : micStatus === 'testing'
                  ? colors.primaryLight
                  : colors.cardBorder + '40',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {micStatus === 'blocked' && <Ionicons name="mic-off" size={13} color="#dc2626" />}
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: '700',
                color:
                  micStatus === 'ready'
                    ? '#065f46'
                    : micStatus === 'blocked'
                    ? '#dc2626'
                    : micStatus === 'testing'
                    ? colors.primary
                    : colors.textMuted,
              }}
            >
              {micStatus === 'ready'
                ? '✓ Đã nhận diện Micro'
                : micStatus === 'blocked'
                ? 'Bị chặn / Không có'
                : micStatus === 'testing'
                ? 'Đang đo tín hiệu...'
                : 'Chưa kiểm tra Microphone'}
            </ThemedText>
          </View>
        </View>

        {/* Sound Level Meter Bar */}
        <View
          style={{
            height: 10,
            width: '100%',
            backgroundColor: colors.cardBorder + '60',
            borderRadius: 6,
            overflow: 'hidden',
            padding: 2,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${meterLevel}%`,
              backgroundColor: micStatus === 'ready' ? '#10b981' : micStatus === 'blocked' ? '#dc2626' : colors.primary,
              borderRadius: 4,
            }}
          />
        </View>

        {/* Green Success Banner when Microphone is Ready */}
        {micStatus === 'ready' && (
          <View
            style={{
              backgroundColor: '#ecfdf5',
              borderColor: '#a7f3d0',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#065f46' }}>
                Tín hiệu Microphone hoạt động tốt! ✓
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 11.5, color: '#047857', lineHeight: 16 }}>
              Giọng nói sẽ được chuyển thành văn bản trong phiên. Bạn có thể chỉnh sửa trước khi nộp.
            </ThemedText>
            <TouchableOpacity onPress={() => setMicStatus('idle')}>
              <ThemedText style={{ fontSize: 11.5, fontWeight: '700', color: '#065f46', textDecorationLine: 'underline', marginTop: 2 }}>
                Thay vào đó, tôi muốn gõ văn bản
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Red Error Banner when Microphone is Blocked */}
        {micStatus === 'blocked' && (
          <View
            style={{
              backgroundColor: '#fef2f2',
              borderColor: '#fca5a5',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Ionicons name="mic-off-outline" size={20} color="#dc2626" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#991b1b', marginBottom: 2 }}>
                  Quyền truy cập Microphone bị từ chối.
                </ThemedText>
                <ThemedText style={{ fontSize: 11.5, color: '#b91c1c', lineHeight: 16 }}>
                  Bạn có thể bấm vào biểu tượng ổ khóa trên thanh địa chỉ hoặc Cài đặt ứng dụng để cấp quyền micro.
                </ThemedText>
              </View>
            </View>

            {/* Chat box fallback badge */}
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1,
                borderColor: '#fca5a5',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Ionicons name="keypad-outline" size={16} color={colors.primary} />
                <ThemedText style={{ fontSize: 11, fontWeight: '600', color: '#7f1d1d', flex: 1 }}>
                  Đã tự động chuyển sang chế độ gõ văn bản (Chat Box)
                </ThemedText>
              </View>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            </View>
          </View>
        )}

        {/* Action Button Centered */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4,
            ...(Platform.select({
              web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
              default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              },
            }) as any),
          }}
          onPress={handleTest}
          disabled={micStatus === 'testing'}
        >
          {micStatus === 'testing' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={micStatus === 'ready' ? 'checkmark-circle' : micStatus === 'blocked' ? 'refresh-outline' : 'mic-outline'}
              size={18}
              color={micStatus === 'ready' ? '#10b981' : micStatus === 'blocked' ? '#dc2626' : colors.text}
            />
          )}
          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
            {micStatus === 'testing'
              ? 'Đang đo tín hiệu âm thanh...'
              : micStatus === 'ready'
              ? 'Kiểm tra lại Microphone'
              : micStatus === 'blocked'
              ? 'Thử kiểm tra lại Microphone'
              : 'Kiểm tra Microphone'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.cardBorder, opacity: 0.5 }} />

      {/* Invariant reminders (3 checkmark points) */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Kiểm tra microphone chỉ thu âm tạm trên thiết bị. Khi bạn chọn ghi câu trả lời trong phiên phỏng vấn, âm thanh được gửi tới Microsoft Azure Speech để chuyển thành văn bản (STT). Bạn luôn được đọc và sửa trước khi nộp; có thể dùng bàn phím thay cho giọng nói.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Hệ thống <ThemedText style={{ fontWeight: '800', color: colors.text }}>không chấm điểm ngữ điệu, WPM, phát âm</ThemedText> hay ghi hình camera.
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginTop: 1 }} />
          <ThemedText style={{ flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
            Bạn có thể gõ văn bản trực tiếp nếu không tiện nói.
          </ThemedText>
        </View>
      </View>
    </View>
  );
});
