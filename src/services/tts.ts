import { Platform } from 'react-native';
import { getInterviewSpeechAuthorization } from './speechTokenManager';

class TTSService {
  private isSpeaking = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // Search for native Vietnamese voices (Google Tiếng Việt, Microsoft An, Linh, HoaiMy, etc.)
        const viVoice = voices.find((v) => {
          const lang = (v.lang || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return (
            lang.startsWith('vi') ||
            lang.includes('vi-vn') ||
            lang.includes('vi_vn') ||
            name.includes('vietnam') ||
            name.includes('tiếng việt') ||
            name.includes('hoaimy') ||
            name.includes('linh') ||
            name.includes('an')
          );
        });

        if (viVoice) {
          this.selectedVoice = viVoice;
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  public speak(
    text: string,
    interviewIdOrOnDone?: string | (() => void),
    onDone?: () => void,
    onError?: (err: any) => void
  ): void {
    let interviewId: string | undefined;
    let actualOnDone: (() => void) | undefined = onDone;

    if (typeof interviewIdOrOnDone === 'string') {
      interviewId = interviewIdOrOnDone;
    } else if (typeof interviewIdOrOnDone === 'function') {
      actualOnDone = interviewIdOrOnDone;
    }

    this.stop();

    if (!text.trim()) {
      actualOnDone?.();
      return;
    }

    // Try Azure REST Cloud TTS if interviewId is present
    if (interviewId) {
      void this.speakWithAzureRest(text, interviewId, actualOnDone, onError);
      return;
    }

    this.speakWithLocalVoice(text, actualOnDone, onError);
  }

  private async speakWithAzureRest(
    text: string,
    interviewId: string,
    onDone?: () => void,
    onError?: (err: any) => void
  ) {
    try {
      this.isSpeaking = true;
      const auth = await getInterviewSpeechAuthorization(interviewId);

      const ssml = `<speak version='1.0' xml:lang='vi-VN'><voice xml:lang='vi-VN' xml:gender='Female' name='vi-VN-HoaiMyNeural'>${escapeXml(text)}</voice></speak>`;

      const response = await fetch(
        `https://${auth.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
            'User-Agent': 'NexoraMobile',
          },
          body: ssml,
        }
      );

      if (!response.ok) {
        throw new Error(`Azure TTS REST failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        URL.revokeObjectURL(audioUrl);
        onDone?.();
      };

      audio.onerror = (e) => {
        console.warn('Azure audio playback error, falling back:', e);
        this.isSpeaking = false;
        this.currentAudioElement = null;
        URL.revokeObjectURL(audioUrl);
        this.speakWithLocalVoice(text, onDone, onError);
      };

      await audio.play();
    } catch (err: any) {
      console.warn('Azure TTS REST failed, falling back to local voice:', err);
      this.isSpeaking = false;
      this.currentAudioElement = null;
      this.speakWithLocalVoice(text, onDone, onError);
    }
  }

  private speakWithLocalVoice(
    text: string,
    onDone?: () => void,
    onError?: (err: any) => void
  ) {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        if (!this.selectedVoice) {
          this.initVoices();
        }

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
          utterance.lang = this.selectedVoice.lang;
        } else {
          utterance.lang = 'vi-VN';
        }

        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          this.isSpeaking = false;
          onDone?.();
        };
        utterance.onerror = (e) => {
          this.isSpeaking = false;
          onError?.(e);
        };
        this.isSpeaking = true;
        window.speechSynthesis.speak(utterance);
      } else {
        this.isSpeaking = false;
        onDone?.();
      }
    } catch (err: any) {
      this.isSpeaking = false;
      onError?.(err);
    }
  }

  public stop(): void {
    try {
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.isSpeaking = false;
    } catch {
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export const ttsService = new TTSService();
