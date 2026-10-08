import { campusDataService } from './campusDataService';

export type VoicePriority = 'critical' | 'high' | 'normal' | 'low';

export interface VoiceInstruction {
  id?: string;
  text: string;
  priority?: VoicePriority;
  interrupt?: boolean;
  category?: 'start' | 'turn' | 'step' | 'proximity' | 'arrival' | 'user' | 'faq' | 'system';
  force?: boolean;
  cooldownKey?: string;
  cooldownMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface VoiceOptions {
  priority?: VoicePriority;
  force?: boolean;
  interrupt?: boolean;
  category?: 'start' | 'turn' | 'step' | 'proximity' | 'arrival' | 'user' | 'faq' | 'system';
  cooldownKey?: string;
  cooldownMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Enterprise-grade, centralized Web Speech API service for AEC Smart Campus Navigation.
 * 
 * Features:
 * 1. Queue & Priority Management (Critical > High > Normal > Low).
 * 2. Chromium V8 Garbage Collection Shield (persisting active utterance references).
 * 3. Chromium Audio Autoplay / User-Gesture Auto-Unlocking.
 * 4. Asynchronous voice loading & intelligent Indian English / Natural voice selection.
 * 5. Watchdog timer & keep-alive resume loop to prevent stalled isSpeaking states.
 * 6. Campus-tuned pronunciation normalization (AEC, metrics, abbreviations).
 * 7. Guaranteed state synchronization with 3D character TALK animation.
 */
class SpeechService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private isUnlocked: boolean = false;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private cooldownMap: Map<string, number> = new Map();
  private speakingListeners: Set<(isSpeaking: boolean) => void> = new Set();

  // Queue management
  private queue: VoiceInstruction[] = [];
  private currentInstruction: VoiceInstruction | null = null;
  private isProcessingQueue: boolean = false;

  // Active utterance references to prevent Chromium garbage collection
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();

  // Voices management
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private isVoicesInitialized: boolean = false;

  // Watchdog & keep-alive timers
  private watchdogTimer: number | null = null;
  private keepAliveInterval: number | null = null;
  private cancelSettleTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aec_voice_guidance_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      } else {
        const settings = campusDataService.getGuideSettings();
        this.isEnabled = settings.voiceEnabled;
      }

      this.initVoices();
      this.setupGlobalUnlockListener();
    }
  }

  public isVoiceSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getPreferredVoice(): SpeechSynthesisVoice | null {
    return this.preferredVoice;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aec_voice_guidance_enabled', enabled ? 'true' : 'false');
    }

    if (!enabled) {
      this.stop();
    } else {
      this.speak({
        text: 'Voice navigation enabled.',
        priority: 'high',
        force: true,
        category: 'system',
      });
    }
  }

  public subscribeSpeaking(callback: (isSpeaking: boolean) => void): () => void {
    this.speakingListeners.add(callback);
    callback(this.isSpeaking);
    return () => {
      this.speakingListeners.delete(callback);
    };
  }

  private setSpeakingState(speaking: boolean) {
    if (this.isSpeaking !== speaking) {
      this.isSpeaking = speaking;
      this.speakingListeners.forEach((cb) => {
        try {
          cb(speaking);
        } catch (e) {
          console.warn('[SpeechService] Listener callback error:', e);
        }
      });
    }
  }

  /**
   * Initializes and caches voices with priority for Indian English / natural English.
   */
  private initVoices(): void {
    if (!this.isVoiceSupported()) return;

    const populateVoices = () => {
      try {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.voices = list;
          this.selectBestVoice();
          this.isVoicesInitialized = true;
        }
      } catch (e) {
        console.warn('[SpeechService] Could not retrieve voices:', e);
      }
    };

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  private selectBestVoice(): void {
    if (this.voices.length === 0) return;

    // 1. Search for Indian English voices (en-IN)
    const inVoice = this.voices.find(
      (v) =>
        v.lang === 'en-IN' ||
        v.lang === 'en_IN' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('veena') ||
        v.name.toLowerCase().includes('rishi')
    );
    if (inVoice) {
      this.preferredVoice = inVoice;
      return;
    }

    // 2. Search for natural or high quality English voices
    const naturalVoice = this.voices.find(
      (v) =>
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('samantha')) ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('daniel'))
    );
    if (naturalVoice) {
      this.preferredVoice = naturalVoice;
      return;
    }

    // 3. Any English voice (en-US, en-GB, en)
    const enVoice = this.voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) {
      this.preferredVoice = enVoice;
      return;
    }

    // 4. Fallback to default voice
    this.preferredVoice = this.voices[0] || null;
  }

  /**
   * Automatically unlocks SpeechSynthesis and AudioContext on first user interaction.
   */
  private setupGlobalUnlockListener(): void {
    const handleFirstTouch = () => {
      this.unlock();
      ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
        window.removeEventListener(evt, handleFirstTouch);
      });
    };

    ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, handleFirstTouch, { passive: true });
    });
  }

  /**
   * Public unlock method. Can be invoked on Splash click, Button click, or Tab navigation.
   */
  public unlock(): void {
    if (!this.isVoiceSupported() || this.isUnlocked) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Silent micro-utterance to prime browser audio subsystem
      const primer = new SpeechSynthesisUtterance(' ');
      primer.volume = 0.01;
      primer.rate = 2.0;
      this.activeUtterances.add(primer);

      primer.onend = () => {
        this.activeUtterances.delete(primer);
      };
      primer.onerror = () => {
        this.activeUtterances.delete(primer);
      };

      window.speechSynthesis.speak(primer);
      this.isUnlocked = true;
    } catch {
      // Non-critical, fallback will activate on first speak()
    }
  }

  /**
   * Cleans text and normalizes technical terms, metric distances, and campus landmarks for clear speech.
   */
  private sanitizeForSpeech(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/\bAEC\b/g, 'A-E-C')
      .replace(/\b(\d+)\s*m\b/gi, '$1 metres')
      .replace(/\b(\d+)\s*min\b/gi, '$1 minutes')
      .replace(/\bDr\.\s*/g, 'Doctor ')
      .replace(/\bDept\.\s*/g, 'Department ')
      .replace(/\bAdmin\b/g, 'Administrative')
      .replace(/\bCSE\b/g, 'C-S-E')
      .replace(/\bECE\b/g, 'E-C-E')
      .replace(/\bEEE\b/g, 'E-E-E')
      .replace(/\bAI\s*&\s*DS\b/gi, 'A-I and Data Science')
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Primary speak method. Supports string or structured VoiceInstruction, with priority & queueing.
   */
  public speak(
    input: string | VoiceInstruction,
    forceOrOptions?: boolean | VoiceOptions
  ): void {
    if (!this.isVoiceSupported()) return;

    let instruction: VoiceInstruction;
    if (typeof input === 'string') {
      const opts: VoiceOptions =
        typeof forceOrOptions === 'boolean'
          ? { force: forceOrOptions, priority: forceOrOptions ? 'high' : 'normal' }
          : forceOrOptions || {};

      instruction = {
        text: input,
        priority: opts.priority || (opts.force ? 'high' : 'normal'),
        force: opts.force,
        interrupt: opts.interrupt,
        category: opts.category,
        cooldownKey: opts.cooldownKey,
        cooldownMs: opts.cooldownMs,
        onStart: opts.onStart,
        onEnd: opts.onEnd,
        onError: opts.onError,
      };
    } else {
      instruction = input;
    }

    if (!this.isEnabled && !instruction.force) return;

    const cleanText = this.sanitizeForSpeech(instruction.text);
    if (!cleanText) return;
    instruction.text = cleanText;

    const priority = instruction.priority || 'normal';
    const now = Date.now();

    // Cooldown deduplication check (prevents GPS jitter repeating identical messages)
    const cooldownKey = instruction.cooldownKey || cleanText;
    const cooldownDuration = instruction.cooldownMs ?? 7000;
    const lastSpoke = this.cooldownMap.get(cooldownKey) || 0;

    if (!instruction.force && priority !== 'critical' && now - lastSpoke < cooldownDuration) {
      return;
    }

    this.cooldownMap.set(cooldownKey, now);
    this.lastSpokenText = cleanText;
    this.lastSpokenTime = now;

    // Handle Priority Interruption
    if (priority === 'critical') {
      // Critical (e.g. Arrival): cancel everything, clear queue, play immediately
      this.stopInternal(false);
      this.queue = [];
      this.currentInstruction = instruction;
      this.executeUtterance(instruction);
      return;
    }

    if (priority === 'high' && (instruction.interrupt || this.shouldInterruptCurrent(priority))) {
      // High priority (Start navigation, explicit Repeat): cancel current normal/low and play
      this.stopInternal(false);
      // Remove any pending low/normal priority items
      this.queue = this.queue.filter((item) => item.priority === 'critical' || item.priority === 'high');
      this.currentInstruction = instruction;
      this.executeUtterance(instruction);
      return;
    }

    // Normal or Low: If idle, play now. If busy, add to queue
    if (!this.isSpeaking && !this.currentInstruction) {
      this.currentInstruction = instruction;
      this.executeUtterance(instruction);
    } else {
      if (priority === 'low') {
        // Drop low priority items if queue is already non-empty to avoid backlog
        if (this.queue.length === 0) {
          this.queue.push(instruction);
        }
      } else {
        // If an existing instruction of the same step/category is in queue, replace it
        if (instruction.category && instruction.category === 'turn') {
          this.queue = this.queue.filter((q) => q.category !== 'turn');
        }
        this.queue.push(instruction);
      }
    }
  }

  private shouldInterruptCurrent(newPriority: VoicePriority): boolean {
    if (!this.currentInstruction) return false;
    const currentPri = this.currentInstruction.priority || 'normal';
    if (newPriority === 'critical') return true;
    if (newPriority === 'high' && (currentPri === 'normal' || currentPri === 'low')) return true;
    return false;
  }

  /**
   * Internal utterance execution with complete lifecycle guarantees and watchdog.
   */
  private executeUtterance(instruction: VoiceInstruction): void {
    try {
      if (!this.isVoicesInitialized) {
        this.initVoices();
      }

      const utterance = new SpeechSynthesisUtterance(instruction.text);
      const settings = campusDataService.getGuideSettings();

      utterance.rate = 0.96; // Clear, collegiate, accessible cadence
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0.1, Math.min(1.0, settings.volume || 1.0));
      utterance.lang = this.preferredVoice?.lang || settings.voiceLanguage || 'en-IN';

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      // V8 GC Shield: Retain utterance reference in instance Set
      this.activeUtterances.add(utterance);

      // Setup Watchdog Timer to prevent permanent speaking lock if browser drops onend
      this.clearWatchdog();
      const words = instruction.text.split(/\s+/).length;
      // Normal speech is ~2.5 words/sec. Estimate max duration + 4000ms safety buffer
      const estimatedDurationMs = Math.max(3500, Math.round((words / 2.0) * 1000) + 4000);

      this.watchdogTimer = window.setTimeout(() => {
        if (this.isSpeaking && this.currentInstruction === instruction) {
          console.warn('[SpeechService] Watchdog timer expired: browser dropped onend. Releasing speaking state.');
          this.finalizeUtterance(utterance, instruction);
        }
      }, estimatedDurationMs);

      // Chromium Keep-Alive loop: prevents speech synthesis from freezing on longer phrases
      this.startKeepAlive();

      utterance.onstart = () => {
        this.setSpeakingState(true);
        if (instruction.onStart) {
          instruction.onStart();
        }
      };

      utterance.onend = () => {
        this.finalizeUtterance(utterance, instruction);
        if (instruction.onEnd) {
          instruction.onEnd();
        }
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechService] Utterance error event:', e);
        this.finalizeUtterance(utterance, instruction);
        if (instruction.onError) {
          instruction.onError(e);
        }
      };

      // Ensure synthesizer is in resume state before speak
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService] Error invoking speechSynthesis.speak:', err);
      this.finalizeUtterance(null, instruction);
      if (instruction.onError) {
        instruction.onError(err);
      }
    }
  }

  private finalizeUtterance(
    utterance: SpeechSynthesisUtterance | null,
    instruction: VoiceInstruction
  ): void {
    this.clearWatchdog();
    this.stopKeepAlive();

    if (utterance) {
      this.activeUtterances.delete(utterance);
    }

    if (this.currentInstruction === instruction) {
      this.currentInstruction = null;
    }

    // If queue is empty, reset speaking state
    if (this.queue.length === 0) {
      this.setSpeakingState(false);
    }

    // Process next item in queue after natural pause
    if (this.queue.length > 0) {
      window.setTimeout(() => {
        this.processNextInQueue();
      }, 260);
    } else {
      this.setSpeakingState(false);
    }
  }

  private processNextInQueue(): void {
    if (this.queue.length === 0) {
      this.setSpeakingState(false);
      return;
    }

    const next = this.queue.shift();
    if (next) {
      this.currentInstruction = next;
      this.executeUtterance(next);
    }
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveInterval = window.setInterval(() => {
      if (this.isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 2500);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer !== null) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Stops current audio and optionally clears the queue.
   */
  private stopInternal(clearQueue: boolean = true): void {
    this.clearWatchdog();
    this.stopKeepAlive();

    if (this.isVoiceSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    this.activeUtterances.clear();
    this.currentInstruction = null;

    if (clearQueue) {
      this.queue = [];
    }

    this.setSpeakingState(false);
  }

  public stop(): void {
    this.stopInternal(true);
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public repeatLast(): void {
    if (this.lastSpokenText) {
      this.speak({
        text: this.lastSpokenText,
        priority: 'high',
        interrupt: true,
        force: true,
        category: 'user',
      });
    }
  }
}

export const speechService = new SpeechService();
