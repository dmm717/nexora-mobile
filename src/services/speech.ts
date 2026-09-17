import { Platform } from 'react-native';

export interface SpeechRecognitionListener {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'vi-VN'; // Primary Vietnamese speech recognition
      }
    }
  }

  public isAvailable(): boolean {
    if (Platform.OS === 'web') {
      return !!this.recognition;
    }
    return true; // Supported via speech input on native keyboards/dictation
  }

  public startListening(listener: SpeechRecognitionListener) {
    if (this.isListening) return;

    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          if (currentText) {
            listener.onResult(currentText, !!finalTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          listener.onError(event.error || 'Lỗi nhận diện giọng nói');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          listener.onEnd();
        };

        this.recognition.start();
        this.isListening = true;
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        listener.onError(err.message || 'Không thể mở Micro');
      }
    } else {
      // Native Dictation trigger fallback notice
      this.isListening = true;
      listener.onResult('', false);
    }
  }

  public stopListening() {
    if (!this.isListening) return;
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.isListening = false;
  }
}

export const speechService = new SpeechService();
