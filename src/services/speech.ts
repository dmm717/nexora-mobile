/**
 * speech.ts — Native STT: expo-audio recording + Azure STT REST API.
 *
 * Architecture:
 * - useAudioRecorder() is a React hook → must live inside a component.
 * - This file provides a custom hook `useNativeStt` that wraps the recording
 *   lifecycle + Azure transcription into one clean API.
 *
 * Flow:
 * 1. User presses Record → hook calls recorder.prepareToRecordAsync() then recorder.record()
 * 2. User presses Stop → hook calls recorder.stop(), reads recorder.uri
 * 3. Upload WAV file to Azure STT REST API using Bearer token from BE
 * 4. Return transcribed text to parent component
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from './logger';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { getInterviewSpeechAuthorization } from './speechTokenManager';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SttStatus = 'idle' | 'recording' | 'processing' | 'error';

export interface UseNativeSttReturn {
  /** Current status of the STT pipeline */
  status: SttStatus;
  /** Whether currently recording */
  isRecording: boolean;
  /** Duration of current recording in seconds */
  durationSeconds: number;
  /** Last error message, if any */
  errorMessage: string | null;
  /** Microphone metering level (dBFS, useful for UI visualisation) */
  metering: number;
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and transcribe via Azure STT. Returns transcribed text. */
  stopAndTranscribe: () => Promise<string>;
  /** Cancel recording without transcribing */
  cancel: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Permission helpers (can be called outside of hooks)
// ---------------------------------------------------------------------------
export async function requestMicrophonePermission(): Promise<boolean> {
  const result = await requestRecordingPermissionsAsync();
  return result.granted;
}

export async function getMicrophonePermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const result = await getRecordingPermissionsAsync();
  if (result.granted) return 'granted';
  if (result.canAskAgain === false) return 'denied';
  return 'undetermined';
}

// ---------------------------------------------------------------------------
// Azure STT REST call
// ---------------------------------------------------------------------------
async function transcribeWithAzure(
  fileUri: string,
  token: string,
  region: string,
): Promise<string> {
  const endpoint =
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1` +
    `?language=vi-VN&format=detailed`;

  // Read file as base64, convert to binary for fetch body
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      Accept: 'application/json',
    },
    body: bytes.buffer,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Azure STT returned ${response.status}: ${errorText}`);
  }

  const json = await response.json();

  if (json.RecognitionStatus === 'Success') {
    return (json.NBest?.[0]?.Display || json.DisplayText || '').trim();
  }
  if (json.RecognitionStatus === 'NoMatch' || json.RecognitionStatus === 'InitialSilenceTimeout') {
    return ''; // No speech detected
  }
  throw new Error(`Azure STT: ${json.RecognitionStatus || 'Unknown status'}`);
}

// ---------------------------------------------------------------------------
// Recording preset for STT (WAV 16kHz mono)
// ---------------------------------------------------------------------------
const STT_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

// ---------------------------------------------------------------------------
// Hook: useNativeStt
// ---------------------------------------------------------------------------
/**
 * React hook that manages the full native STT pipeline:
 * expo-audio recording → Azure STT REST transcription.
 *
 * Must be called inside a React component.
 */
export function useNativeStt(interviewId: string | undefined): UseNativeSttReturn {
  const recorder = useAudioRecorder(STT_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder);

  const [status, setStatus] = useState<SttStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    if (status === 'recording') return;
    setErrorMessage(null);

    const granted = await requestMicrophonePermission();
    if (!granted) {
      setStatus('error');
      setErrorMessage('Microphone chưa được cấp quyền. Vui lòng cho phép trong Cài đặt.');
      return;
    }

    // Configure audio mode for recording
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    startTimeRef.current = Date.now();
    setStatus('recording');

    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [status, recorder]);

  const stopAndTranscribe = useCallback(async (): Promise<string> => {
    if (status !== 'recording') return '';

    setStatus('processing');

    let fileUriToCleanUp: string | null = null;
    try {
      await recorder.stop();
      const fileUri = recorder.uri;

      if (!fileUri) {
        throw new Error('Recording produced no file');
      }
      fileUriToCleanUp = fileUri;

      if (!interviewId) {
        throw new Error('Interview ID is required for transcription');
      }

      // Get Azure token from BE
      const auth = await getInterviewSpeechAuthorization(interviewId);

      // Transcribe with Azure
      const text = await transcribeWithAzure(fileUri, auth.token, auth.region);

      setStatus('idle');
      return text;
    } catch (err: any) {
      logger.warn('STT transcription failed:', { error: err?.message || err });
      setStatus('error');
      setErrorMessage(err.message || 'Không thể nhận diện giọng nói. Vui lòng thử lại.');
      return '';
    } finally {
      // Clean up temp file (Phase 1.2 strict requirement)
      if (fileUriToCleanUp) {
        try {
          await FileSystem.deleteAsync(fileUriToCleanUp, { idempotent: true });
        } catch (err: any) {
          logger.warn('Failed to clean up temp audio file:', { error: err?.message || err });
        }
      }
    }
  }, [status, recorder, interviewId]);

  const cancel = useCallback(async () => {
    if (status === 'recording') {
      try {
        await recorder.stop();
        const uri = recorder.uri;
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (err: any) {
        logger.warn('Failed to cancel and clean up audio recording:', { error: err?.message || err });
      }
    }
    setStatus('idle');
    setErrorMessage(null);
  }, [status, recorder]);

  // Clean up if component unmounts while recording
  const recorderRef = useRef(recorder);
  useEffect(() => {
    recorderRef.current = recorder;
  }, [recorder]);

  useEffect(() => {
    return () => {
      // Only clean up on actual unmount
      if (recorderRef.current.isRecording) {
        recorderRef.current.stop().then(() => {
          if (recorderRef.current.uri) {
            FileSystem.deleteAsync(recorderRef.current.uri, { idempotent: true }).catch(() => {});
          }
        }).catch(() => {});
      }
    };
  }, []);

  const durationSeconds = status === 'recording'
    ? Math.round((recorderState.durationMillis || 0) / 1000)
    : 0;

  return {
    status,
    isRecording: status === 'recording',
    durationSeconds,
    errorMessage,
    metering: recorderState.metering ?? -160,
    startRecording,
    stopAndTranscribe,
    cancel,
  };
}
