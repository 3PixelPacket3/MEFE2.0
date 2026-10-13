// Web Speech API Text-to-Speech Controller

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  speak(
    text: string,
    language: 'en' | 'fr' | 'es' = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): boolean {
    if (!this.synth || !this.isSupported) {
      console.warn('Web Speech API is not supported in this browser.');
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Set language
    utterance.lang = language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1.05; // Lively, energetic tempo
    utterance.pitch = 1.15; // Bright, stylish tone

    // Pick best matching voice
    const voices = this.synth.getVoices();
    const voiceLangPrefix = utterance.lang.slice(0, 2);
    
    // Look for expressive voices
    const preferredVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const matchLang = v.lang.toLowerCase().startsWith(voiceLangPrefix);
      return matchLang && (
        name.includes('samantha') ||
        name.includes('victoria') ||
        name.includes('karen') ||
        name.includes('natural') ||
        name.includes('google') ||
        name.includes('fiona') ||
        name.includes('amélie') ||
        name.includes('monica')
      );
    }) || voices.find(v => v.lang.toLowerCase().startsWith(voiceLangPrefix));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
    return true;
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechService = new SpeechService();
