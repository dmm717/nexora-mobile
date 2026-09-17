class TTSService {
  private isSpeaking = false;

  public speak(text: string, onDone?: () => void, onError?: (err: any) => void): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
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

export const ttsService = new TTSService();
