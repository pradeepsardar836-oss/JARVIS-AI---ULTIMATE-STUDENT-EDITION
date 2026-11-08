// Web Audio and Speech Engine for JARVIS AI – Ultimate Student Edition

class JarvisAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private recognition: any = null;
  private isListeningContinuous: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
      }
    }
  }

  // Load and prioritize natural Hindi male voices
  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Look for Hindi voices first
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') && (v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('madhur') || v.name.toLowerCase().includes('male')));
    const generalHindi = voices.find(v => v.lang.startsWith('hi'));
    const indianEnglish = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('prabhat'));
    const deepMale = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));

    this.selectedVoice = hindiVoice || generalHindi || indianEnglish || deepMale || voices[0] || null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }

  // Procedural Futuristic Sound FX using Web Audio API Oscillators
  public playBootSound() {
    this.initAudioContext();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playChime(type: 'beep' | 'success' | 'interrupt' | 'listen') {
    this.initAudioContext();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === 'listen') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'interrupt') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
  }

  // Speak text in Hindi / English with natural parameters
  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous speech immediately (supports interruption)
    this.synth.cancel();

    // Clean text of markdown asterisks/formatting for clean speech
    const cleanSpeechText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\{.*?\}/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = this.selectedVoice?.lang || 'hi-IN';
    utterance.rate = 1.0;
    utterance.pitch = 0.88; // Deep, authoritative JARVIS male tone

    utterance.onstart = () => {
      this.playChime('beep');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  // Stop speech synthesis immediately (Interruption)
  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.playChime('interrupt');
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  // Get dynamic frequency data for visualizer
  public getFrequencyData(): number[] {
    if (!this.analyser || !this.dataArray) {
      // Return simulated subtle ambient pulse
      return Array.from({ length: 16 }, (_, i) => Math.sin(Date.now() * 0.005 + i) * 15 + 25);
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return Array.from(this.dataArray.slice(0, 16));
  }

  // Setup Web Speech Recognition
  public initSpeechRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onStateChange?: (isListening: boolean) => void
  ) {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser environment');
      return null;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'hi-IN'; // Recognizes Hindi and Hinglish

    this.recognition.onstart = () => {
      if (onStateChange) onStateChange(true);
      this.playChime('listen');
    };

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

      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListeningContinuous && this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          // Ignore if already active
        }
      } else {
        if (onStateChange) onStateChange(false);
      }
    };

    return this.recognition;
  }

  public startListening(continuous: boolean = true) {
    this.isListeningContinuous = continuous;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.log('Recognition already active or starting');
      }
    }
  }

  public stopListening() {
    this.isListeningContinuous = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const jarvisAudio = new JarvisAudioEngine();
