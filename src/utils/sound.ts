type SoundKind = 'hover' | 'click' | 'switch' | 'scan' | 'success' | 'error' | 'modalOpen' | 'modalClose';

const STORAGE_KEY = 'techaditya_sound_enabled';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastHoverAt = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'false') {
          this.enabled = false;
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || !this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
    }
    if (next) {
      this.play('switch');
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    return next;
  }

  public play(kind: SoundKind): void {
    if (!this.enabled) return;

    if (kind === 'hover') {
      const nowMs = performance.now();
      if (nowMs - this.lastHoverAt < 55) return;
      this.lastHoverAt = nowMs;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    switch (kind) {
      case 'hover': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 1320,
          endFreq: 1580,
          duration: 0.022,
          gain: 0.018,
          startTime: t,
        });
        break;
      }
      case 'click': {
        this.tone(ctx, {
          type: 'triangle',
          startFreq: 540,
          endFreq: 210,
          duration: 0.042,
          gain: 0.055,
          startTime: t,
        });
        break;
      }
      case 'switch': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 420,
          endFreq: 620,
          duration: 0.055,
          gain: 0.045,
          startTime: t,
        });
        break;
      }
      case 'scan': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 440,
          endFreq: 660,
          duration: 0.075,
          gain: 0.045,
          startTime: t,
        });
        this.tone(ctx, {
          type: 'sine',
          startFreq: 660,
          endFreq: 880,
          duration: 0.065,
          gain: 0.035,
          startTime: t + 0.055,
        });
        break;
      }
      case 'success': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 587.33,
          endFreq: 587.33,
          duration: 0.09,
          gain: 0.045,
          startTime: t,
        });
        this.tone(ctx, {
          type: 'sine',
          startFreq: 880,
          endFreq: 880,
          duration: 0.14,
          gain: 0.045,
          startTime: t + 0.07,
        });
        break;
      }
      case 'error': {
        this.tone(ctx, {
          type: 'triangle',
          startFreq: 190,
          endFreq: 135,
          duration: 0.11,
          gain: 0.055,
          startTime: t,
        });
        break;
      }
      case 'modalOpen': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 320,
          endFreq: 640,
          duration: 0.09,
          gain: 0.04,
          startTime: t,
        });
        break;
      }
      case 'modalClose': {
        this.tone(ctx, {
          type: 'sine',
          startFreq: 520,
          endFreq: 280,
          duration: 0.075,
          gain: 0.035,
          startTime: t,
        });
        break;
      }
    }
  }

  private tone(
    ctx: AudioContext,
    opts: {
      type: OscillatorType;
      startFreq: number;
      endFreq: number;
      duration: number;
      gain: number;
      startTime: number;
    }
  ): void {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.startFreq, opts.startTime);
    if (opts.endFreq !== opts.startFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.endFreq),
        opts.startTime + opts.duration
      );
    }

    amp.gain.setValueAtTime(0.0001, opts.startTime);
    amp.gain.exponentialRampToValueAtTime(opts.gain, opts.startTime + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, opts.startTime + opts.duration);

    osc.connect(amp);
    amp.connect(ctx.destination);

    osc.start(opts.startTime);
    osc.stop(opts.startTime + opts.duration + 0.01);
  }
}

export const uiSound = new SoundEngine();
