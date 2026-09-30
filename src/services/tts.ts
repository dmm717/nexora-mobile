/**
 * tts.ts — Native TTS via Azure Speech SDK WebSocket + expo-audio playback.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File as ExpoFile, Paths } from 'expo-file-system';
import { getInterviewSpeechAuthorization } from './speechTokenManager';
import { INTERVIEW_SPEECH_CONFIG } from '@/config/speech';
import { logger } from './logger';
import * as Crypto from 'expo-crypto';

const _global = globalThis as any;
if (typeof _global.crypto !== 'object') {
  _global.crypto = {};
}
if (typeof _global.crypto.getRandomValues !== 'function') {
  _global.crypto.getRandomValues = Crypto.getRandomValues.bind(Crypto);
}

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

async function synthesizeToFile(
  text: string,
  token: string,
  region: string,
  signal?: AbortSignal,
): Promise<string> {
  const tStart = Date.now();
  
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  // Escape XML characters in text
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' name='${INTERVIEW_SPEECH_CONFIG.voiceName}'>${escapedText}</voice></speak>`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'User-Agent': 'Nexora-App',
    },
    body: ssml,
    signal,
  });

  const tNetwork = Date.now();
  console.log(`[TTS Perf] HTTP POST completed in ${tNetwork - tStart}ms`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS REST API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  
  // React Native's blob/FileReader is notoriously slow. 
  // We manually encode the ArrayBuffer to base64 in JS (takes ~50ms) to avoid bridge freezing.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  let base64Data = '';
  
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;
    
    base64Data += chars[b1 >> 2];
    base64Data += chars[((b1 & 3) << 4) | (b2 >> 4)];
    base64Data += i + 1 < len ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    base64Data += i + 2 < len ? chars[b3 & 63] : '=';
  }
  
  const destFile = new ExpoFile(Paths.cache, `tts_${Date.now()}.mp3`);
  destFile.create({ overwrite: true });
  destFile.write(base64Data, { encoding: 'base64' });
  
  const tEnd = Date.now();
  console.log(`[TTS Perf] File write completed. Total: ${tEnd - tStart}ms`);
  
  return destFile.uri;
}

export interface UseNativeTtsReturn {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

export function useNativeTts(interviewId: string | undefined): UseNativeTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentFileRef = useRef<ExpoFile | null>(null);
  const shouldPlayRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isWaitingForNewFileRef = useRef(false);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const cleanupFile = useCallback(() => {
    const file = currentFileRef.current;
    if (file) {
      try { file.delete(); } catch { /* ignore */ }
      currentFileRef.current = null;
    }
  }, []);

  const cleanupNetwork = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    cleanupNetwork();
    cleanupFile();
  }, [cleanupNetwork, cleanupFile]);

  useEffect(() => {
    if (shouldPlayRef.current && playerStatus.isLoaded && !playerStatus.playing) {
      shouldPlayRef.current = false;
      try {
        player.play();
      } catch (err: any) {
        logger.warn('Failed to auto-play TTS:', { error: err?.message || err });
        setIsSpeaking(false);
        cleanup();
      }
    }
  }, [playerStatus.isLoaded, playerStatus.playing, player, cleanup]);

  useEffect(() => {
    if (playerStatus.playing) {
      isWaitingForNewFileRef.current = false;
    }
  }, [playerStatus.playing]);

  useEffect(() => {
    if (isWaitingForNewFileRef.current) return;

    if (isSpeaking && playerStatus.playing === false && playerStatus.isLoaded) {
      if (playerStatus.currentTime > 0 && playerStatus.currentTime >= (playerStatus.duration - 0.1)) {
        setIsSpeaking(false);
        cleanup();
      }
    }
  }, [playerStatus.playing, playerStatus.currentTime, playerStatus.duration, playerStatus.isLoaded, isSpeaking, cleanup]);

  const speak = useCallback(async (text: string) => {
    cleanupNetwork();
    abortControllerRef.current = new AbortController();
    const currentSignal = abortControllerRef.current.signal;

    isWaitingForNewFileRef.current = true;
    shouldPlayRef.current = false;
    try {
      player.pause();
    } catch (err: any) {
      logger.warn('Failed to pause player before new speech:', { error: err?.message || err });
    }
    cleanupFile();
    setIsSpeaking(false);

    if (!text.trim() || !interviewId) return;

    try {
      setIsSpeaking(true);

      const t0 = Date.now();
      const auth = await getInterviewSpeechAuthorization(interviewId);
      const t1 = Date.now();

      const fileUri = await synthesizeToFile(text, auth.token, auth.region, currentSignal);
      const t2 = Date.now();

      console.log(`[TTS Perf] Token: ${t1 - t0}ms | SDK+File: ${t2 - t1}ms | Total: ${t2 - t0}ms`);

      currentFileRef.current = new ExpoFile(fileUri);
      shouldPlayRef.current = true;
      player.replace(fileUri);
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || '';
      if (err.name === 'AbortError' || errMsg.includes('FetchRequestCanceledException') || errMsg.includes('aborted')) {
        return;
      }
      logger.warn('Native TTS SDK failed:', { error: errMsg });
      shouldPlayRef.current = false;
      setIsSpeaking(false);
      cleanup();
    }
  }, [interviewId, player, cleanup]);

  const stop = useCallback(() => {
    isWaitingForNewFileRef.current = false;
    shouldPlayRef.current = false;
    try {
      player.pause();
    } catch (err: any) {
      logger.warn('Failed to pause player during stop:', { error: err?.message || err });
    }
    setIsSpeaking(false);
    cleanup();
  }, [player, cleanup]);

  useEffect(() => {
    return () => {
      shouldPlayRef.current = false;
      try {
        player.pause();
      } catch (err: any) {
        logger.warn('Failed to pause player during cleanup:', { error: err?.message || err });
      }
      cleanup();
    };
  }, [cleanup, player]);

  return { isSpeaking, speak, stop };
}
