import { Platform } from 'react-native';

export interface SpeechRecognitionListener {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private userRequestedStop = false;
  private accumulatedFinalText = '';
  private processedIndexes = new Set<number>();
  private activeListener: SpeechRecognitionListener | null = null;
  private baseText = '';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'vi-VN';
      }
    }
  }

  public isAvailable(): boolean {
    if (Platform.OS === 'web') {
      return !!this.recognition;
    }
    return true;
  }

  public async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'microphone' as any });
          return status.state as 'granted' | 'denied' | 'prompt';
        }
      } catch (e) {
        // Fallback for browsers that don't support permissions.query for microphone
      }
    }
    return 'prompt';
  }

  public startListening(listener: SpeechRecognitionListener, initialBaseText: string = '') {
    if (this.isListening) return;

    this.baseText = initialBaseText.trim();
    this.accumulatedFinalText = '';
    this.processedIndexes.clear();
    this.userRequestedStop = false;
    this.activeListener = listener;

    if (Platform.OS === 'web' && this.recognition) {
      this.setupWebListeners();
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (err: any) {
        console.warn('Failed to start speech recognition:', err);
        // If start throws because instance was in wrong state, re-init and retry
        this.initRecognition();
        if (this.recognition) {
          this.setupWebListeners();
          try {
            this.recognition.start();
            this.isListening = true;
            return;
          } catch (e: any) {
            listener.onError(e.message || 'Không thể bật Microphone');
            return;
          }
        }
        listener.onError(err.message || 'Không thể bật Microphone');
      }
    } else {
      this.isListening = true;
      listener.onResult(initialBaseText, false);
    }
  }

  private setupWebListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      if (!event.results) return;

      // 1. Process ALL final segments from index 0 to length - 1 (never miss previous segments!)
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result.isFinal && !this.processedIndexes.has(i)) {
          this.processedIndexes.add(i);
          const segmentText = (result[0]?.transcript || '').trim();
          if (segmentText) {
            this.accumulatedFinalText = this.accumulatedFinalText
              ? `${this.accumulatedFinalText} ${segmentText}`
              : segmentText;
          }
        }
      }

      // 2. Process current interim preview text (un-finalized results)
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && !result.isFinal) {
          interimTranscript += result[0]?.transcript || '';
        }
      }

      // 3. Combine baseText + accumulatedFinalText + interimTranscript
      const combinedSpeech = [this.accumulatedFinalText, interimTranscript.trim()]
        .filter(Boolean)
        .join(' ');

      const fullTranscript = [this.baseText, combinedSpeech]
        .filter(Boolean)
        .join(' ');

      if (this.activeListener) {
        this.activeListener.onResult(fullTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      
      // Ignore 'no-speech' error if user is still recording in continuous session
      if (event.error === 'no-speech' && !this.userRequestedStop) {
        return;
      }

      if (this.userRequestedStop || event.error === 'aborted') {
        return;
      }

      this.isListening = false;
      let userFriendlyError = event.error || 'Lỗi nhận diện giọng nói';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        userFriendlyError = 'Microphone chưa được cấp quyền. Vui lòng cho phép truy cập Micro trong cài đặt trình duyệt hoặc thiết bị.';
      } else if (event.error === 'network') {
        userFriendlyError = 'Lỗi kết nối mạng khi nhận diện giọng nói.';
      }

      if (this.activeListener) {
        this.activeListener.onError(userFriendlyError);
      }
    };

    this.recognition.onend = () => {
      // If user did NOT press "Dừng nói", auto-restart recognition so speech can continue indefinitely!
      if (!this.userRequestedStop && this.activeListener) {
        try {
          this.recognition.start();
          this.isListening = true;
          return;
        } catch {
          // If restart fails, clean up
        }
      }

      this.isListening = false;
      if (this.activeListener) {
        this.activeListener.onEnd();
      }
    };
  }

  public stopListening() {
    this.userRequestedStop = true;
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
