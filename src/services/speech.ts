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
  IOSOutputFormat,
  RecordingOptions,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
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
// STT Text Cleanup
// ---------------------------------------------------------------------------
const VIETNAMESE_FILLER_WORDS = ['ừm', 'ờm', 'ờ', 'à', 'ừ', 'ưm', 'um', 'uh', 'ah'];

function removeFillerWords(text: string): string {
  if (!text) return '';
  
  const fillers = VIETNAMESE_FILLER_WORDS.join('|');
  // Use capturing group for boundaries since JS \b doesn't support Unicode
  const fillerRegex = new RegExp(`(^|[\\s,!?.-])(${fillers})(?=[\\s,!?.-]|$)`, 'gi');
  
  let cleaned = text.replace(fillerRegex, '$1');
  // Run twice to catch any back-to-back fillers (e.g. "ừm ờ") separated by space
  cleaned = cleaned.replace(fillerRegex, '$1');
  
  // Clean up punctuation artifacts
  cleaned = cleaned.replace(/,\\s*,/g, ','); // merge double commas
  cleaned = cleaned.replace(/\\s+([.,!?])/g, '$1'); // remove spaces before punctuation
  cleaned = cleaned.replace(/^[.,!?]\\s*/g, ''); // remove leading punctuation
  cleaned = cleaned.replace(/\\s+/g, ' '); // remove multiple spaces
  cleaned = cleaned.trim();
  
  // Capitalize the first letter if needed
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
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

  const response = await FileSystem.uploadAsync(endpoint, fileUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      Accept: 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error('Không thể chuyển giọng nói thành văn bản. Vui lòng thử lại hoặc dùng bàn phím.');
  }

  const json = JSON.parse(response.body);

  if (json.RecognitionStatus === 'Success') {
    const rawText = (json.NBest?.[0]?.Display || json.DisplayText || '').trim();
    return removeFillerWords(rawText);
  }
  if (json.RecognitionStatus === 'NoMatch' || json.RecognitionStatus === 'InitialSilenceTimeout') {
    return ''; // No speech detected
  }
  throw new Error('Không thể nhận diện giọng nói. Vui lòng thử lại hoặc dùng bàn phím.');
}

// ---------------------------------------------------------------------------
// Recording preset for STT (WAV 16kHz mono)
// ---------------------------------------------------------------------------
const STT_RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  extension: '.wav',
  android: {
    extension: '.wav',
    outputFormat: 'default',
    audioEncoder: 'default',
    sampleRate: 16000,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    sampleRate: 16000,
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
      try {
        if (recorderRef.current.isRecording) {
          recorderRef.current.stop().then(() => {
            try {
              if (recorderRef.current.uri) {
                FileSystem.deleteAsync(recorderRef.current.uri, { idempotent: true }).catch(() => {});
              }
            } catch { /* native object already released */ }
          }).catch(() => {});
        }
      } catch { /* native recorder already destroyed on unmount */ }
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
