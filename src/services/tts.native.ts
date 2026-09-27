/**
 * tts.native.ts — Native TTS via Azure REST API + expo-audio playback.
 *
 * Flow:
 * 1. Build SSML payload.
 * 2. POST to Azure TTS REST endpoint with Bearer token.
 * 3. Save returned MP3 to a temp file.
 * 4. Play using useAudioPlayer hook from expo-audio.
 *
 * Provides a React hook `useNativeTts` for use in interview components.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { getInterviewSpeechAuthorization } from './speechTokenManager';
import { INTERVIEW_SPEECH_CONFIG } from '@/config/speech';

// ---------------------------------------------------------------------------
// SSML Builder (shared with tts.ts/web)
// ---------------------------------------------------------------------------
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function buildSsml(text: string, voiceName: string): string {
  const escaped = escapeXml(text.trim());
  return (
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='vi-VN'>` +
    `<voice name='${voiceName}'>` +
    `<prosody rate='0.95'>${escaped}</prosody>` +
    `</voice>` +
    `</speak>`
  );
}

// ---------------------------------------------------------------------------
// Azure TTS → temp MP3 file
// ---------------------------------------------------------------------------
async function synthesizeToFile(
  text: string,
  token: string,
  region: string,
): Promise<string> {
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  // Attempt 1: Primary voice
  let ssml = buildSsml(text, INTERVIEW_SPEECH_CONFIG.voiceName);
  let response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'User-Agent': 'NexoraMobile',
    },
    body: ssml,
  });

  // Attempt 2: Fallback to vi-VN-HoaiMyNeural
  if (!response.ok) {
    // console.warn( ... );
    ssml = buildSsml(text, 'vi-VN-HoaiMyNeural');
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
        'User-Agent': 'NexoraMobile',
      },
      body: ssml,
    });
  }

  if (!response.ok) {
    throw new Error(`Azure TTS REST failed with status ${response.status}`);
  }

  // Save to temp file
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const tempPath = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(tempPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return tempPath;
}

// ---------------------------------------------------------------------------
// Hook: useNativeTts
// ---------------------------------------------------------------------------
export interface UseNativeTtsReturn {
  /** Whether TTS is currently speaking/playing audio */
  isSpeaking: boolean;
  /** Speak text using Azure TTS. Fetches token, synthesizes, plays. */
  speak: (text: string) => Promise<void>;
  /** Stop current playback */
  stop: () => void;
}

/**
 * React hook for native TTS via Azure REST + expo-audio playback.
 *
 * Uses useAudioPlayer with a dynamic source that changes each time
 * speak() is called (new temp MP3 file each time).
 */
export function useNativeTts(interviewId: string | undefined): UseNativeTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const currentFileRef = useRef<string | null>(null);

  // useAudioPlayer can accept a string URI as source
  const player = useAudioPlayer(audioSource ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);

  const cleanup = useCallback(() => {
    if (currentFileRef.current) {
      FileSystem.deleteAsync(currentFileRef.current, { idempotent: true }).catch(() => {});
      currentFileRef.current = null;
    }
  }, []);

  // Track playback completion
  useEffect(() => {
    if (isSpeaking && playerStatus.playing === false && audioSource !== null) {
      // Player was playing and has stopped → playback finished
      if (playerStatus.currentTime > 0 && playerStatus.currentTime >= (playerStatus.duration - 0.1)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSpeaking(false);
        cleanup();
      }
    }
  }, [playerStatus.playing, playerStatus.currentTime, playerStatus.duration, isSpeaking, audioSource, cleanup]);

  const speak = useCallback(async (text: string) => {
    // Stop any current playback
    try {
      player.pause();
    } catch {
      // ignore
    }
    cleanup();
    setIsSpeaking(false);

    if (!text.trim() || !interviewId) return;

    try {
      setIsSpeaking(true);

      // Configure audio for playback
      await setAudioModeAsync({ playsInSilentMode: true });

      // Get token
      const auth = await getInterviewSpeechAuthorization(interviewId);

      // Synthesize → MP3 file
      const filePath = await synthesizeToFile(text, auth.token, auth.region);
      currentFileRef.current = filePath;

      // Set the audio source — this triggers useAudioPlayer to load the new file
      setAudioSource(filePath);

      // Small delay to allow the player to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Play
      player.play();
    } catch (err) {
      // console.warn('Native TTS failed:', err);
      setIsSpeaking(false);
      cleanup();
    }
  }, [interviewId, player, cleanup]);

  const stop = useCallback(() => {
    try {
      player.pause();
    } catch {
      // ignore
    }
    setIsSpeaking(false);
    cleanup();
  }, [player, cleanup]);

  // Clean up if component unmounts
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {}
      cleanup();
    };
  }, [cleanup, player]);

  return { isSpeaking, speak, stop };
}
