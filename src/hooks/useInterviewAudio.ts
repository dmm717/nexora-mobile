/**
 * useInterviewAudio.ts — Platform-aware audio hook for interview sessions.
 *
 * On native (Android/iOS):
 *   - STT: expo-audio recording → Azure STT REST API
 *   - TTS: Azure TTS REST API → expo-audio playback
 *
 * On web:
 *   - STT: Web Speech API (existing webSpeechInstance)
 *   - TTS: Azure TTS REST → HTMLAudioElement (existing webTtsInstance)
 *
 * This hook unifies the interface so the interview UI doesn't need
 * to know which platform it's running on.
 */
import { Platform } from 'react-native';
import { logger } from '@/services/logger';
import { useState, useCallback, useRef, useEffect } from 'react';

// Web services (always importable — they guard with Platform.OS checks internally)
import { webSpeechInstance } from '../services/speech.web';
import { webTtsInstance } from '../services/tts.web';

// Native hooks (only imported on native via lazy require to avoid web bundling issues)
let useNativeStt: typeof import('../services/speech.native').useNativeStt | null = null;
let useNativeTts: typeof import('../services/tts.native').useNativeTts | null = null;

if (Platform.OS !== 'web') {
  // Dynamic require to avoid importing expo-audio on web
  const speechNative = require('../services/speech.native');
  const ttsNative = require('../services/tts.native');
  useNativeStt = speechNative.useNativeStt;
  useNativeTts = ttsNative.useNativeTts;
}

// ---------------------------------------------------------------------------
// Unified interface
// ---------------------------------------------------------------------------
export interface UseInterviewAudioReturn {
  // STT
  isRecording: boolean;
  isProcessingStt: boolean;
  durationSeconds: number;
  sttErrorMessage: string | null;
  toggleSpeech: () => void;

  // TTS
  isTtsSpeaking: boolean;
  speakTts: (text: string) => void;
  stopTts: () => void;
  toggleTts: (text: string) => void;

  // Mic permission
  isMicAllowed: boolean | null;
  requestMicPermission: () => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Native implementation hook
// ---------------------------------------------------------------------------
function useInterviewAudioNative(
  interviewId: string | undefined,
  onTranscriptionComplete: (text: string) => void,
): UseInterviewAudioReturn {
  // These hooks are guaranteed to exist on native (guarded above)
  const stt = useNativeStt!(interviewId);
  const tts = useNativeTts!(interviewId);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);

  // Check mic permission on mount
  useEffect(() => {
    const { getMicrophonePermissionStatus } = require('./speech.native');
    getMicrophonePermissionStatus().then((status: string) => {
      setIsMicAllowed(status === 'granted');
    });
  }, []);

  const toggleSpeech = useCallback(() => {
    if (tts.isSpeaking) {
      tts.stop();
    }

    if (stt.isRecording) {
      // Stop recording and transcribe
      stt.stopAndTranscribe().then((text: string) => {
        if (text) {
          onTranscriptionComplete(text);
        }
      });
    } else {
      stt.startRecording();
    }
  }, [stt, tts, onTranscriptionComplete]);

  const toggleTts = useCallback((text: string) => {
    if (tts.isSpeaking) {
      tts.stop();
    } else if (text) {
      if (stt.isRecording) {
        stt.cancel();
      }
      tts.speak(text);
    }
  }, [tts, stt]);

  const requestMicPermission = useCallback(async () => {
    const { requestMicrophonePermission } = require('../services/speech.native');
    const granted = await requestMicrophonePermission();
    setIsMicAllowed(granted);
    return granted;
  }, []);

  return {
    isRecording: stt.isRecording,
    isProcessingStt: stt.status === 'processing',
    durationSeconds: stt.durationSeconds,
    sttErrorMessage: stt.errorMessage,
    toggleSpeech,
    isTtsSpeaking: tts.isSpeaking,
    speakTts: tts.speak,
    stopTts: tts.stop,
    toggleTts,
    isMicAllowed,
    requestMicPermission,
  };
}

// ---------------------------------------------------------------------------
// Web implementation hook
// ---------------------------------------------------------------------------
function useInterviewAudioWeb(
  interviewId: string | undefined,
  onTranscriptionComplete: (text: string) => void,
): UseInterviewAudioReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const baseTextRef = useRef('');

  // Check permission on mount
  useEffect(() => {
    webSpeechInstance.checkPermission().then((state: string) => {
      if (state === 'denied') setIsMicAllowed(false);
      else if (state === 'granted') setIsMicAllowed(true);
    });
  }, []);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleSpeech = useCallback(() => {
    if (isTtsSpeaking) {
      webTtsInstance.stop();
      setIsTtsSpeaking(false);
    }

    if (isRecording) {
      webSpeechInstance.stopListening();
      setIsRecording(false);
    } else {
      baseTextRef.current = '';
      setIsRecording(true);
      setDurationSeconds(0);
      webSpeechInstance.startListening(
        {
          onResult: (transcript: string) => {
            onTranscriptionComplete(transcript);
          },
          onError: (err: any) => {
            logger.warn('Web speech error:', { error: err?.message || err });
            setIsRecording(false);
          },
          onEnd: () => {
            setIsRecording(false);
          },
        },
        '',
      );
    }
  }, [isRecording, isTtsSpeaking, onTranscriptionComplete]);

  const speakTts = useCallback((text: string) => {
    setIsTtsSpeaking(true);
    webTtsInstance.speak(
      text,
      interviewId,
      () => setIsTtsSpeaking(false),
      () => setIsTtsSpeaking(false),
    );
  }, [interviewId]);

  const stopTts = useCallback(() => {
    webTtsInstance.stop();
    setIsTtsSpeaking(false);
  }, []);

  const toggleTts = useCallback((text: string) => {
    if (isTtsSpeaking) {
      stopTts();
    } else if (text) {
      if (isRecording) {
        webSpeechInstance.stopListening();
        setIsRecording(false);
      }
      speakTts(text);
    }
  }, [isTtsSpeaking, isRecording, stopTts, speakTts]);

  const requestMicPermission = useCallback(async () => {
    const state = await webSpeechInstance.checkPermission();
    const granted = state === 'granted';
    setIsMicAllowed(granted);
    return granted;
  }, []);

  // Clean up if component unmounts
  useEffect(() => {
    return () => {
      stopTts();
      if (isRecording) {
        webSpeechInstance.stopListening();
      }
    };
  }, [stopTts, isRecording]);

  return {
    isRecording,
    isProcessingStt: false, // Web speech is real-time, no processing phase
    durationSeconds,
    sttErrorMessage: null,
    toggleSpeech,
    isTtsSpeaking,
    speakTts,
    stopTts,
    toggleTts,
    isMicAllowed,
    requestMicPermission,
  };
}

// ---------------------------------------------------------------------------
// Exported unified hook
// ---------------------------------------------------------------------------
/**
 * Platform-aware audio hook for interview sessions.
 * Automatically selects native (expo-audio + Azure REST) or web (Web Speech API)
 * implementation based on Platform.OS.
 */
export function useInterviewAudio(
  interviewId: string | undefined,
  onTranscriptionComplete: (text: string) => void,
): UseInterviewAudioReturn {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useInterviewAudioWeb(interviewId, onTranscriptionComplete);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useInterviewAudioNative(interviewId, onTranscriptionComplete);
}
