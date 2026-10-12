import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const MASTER_LEVEL = 0.7;
/** Long enough for the longest tail (bass, ~2s) to ring out behind the muted master. */
const SETTLE_MS = 2500;

/* One AudioContext for every Offbeat sketch on the page.
 * Browsers only allow audio after a user gesture, so sound starts off and
 * the context is created the first time the visitor turns it on. Each sketch
 * then hangs its own bus off `input`, which runs through a gentle compressor
 * so four studies playing at once never clip.
 * Switching off mutes the master and suspends the context a moment later.
 */
@Injectable({ providedIn: 'root' })
export class OffbeatAudioService {
  readonly enabled$ = new BehaviorSubject(false);

  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  // Bumped on every enable/disable so a slow resume() cannot undo a later disable.
  private op = 0;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;

  get enabled(): boolean {
    return this.enabled$.value;
  }

  get ac(): AudioContext | null {
    return this.context;
  }

  /** Where sketch buses connect. */
  get input(): AudioNode | null {
    return this.master;
  }

  get supported(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window;
  }

  /** Must be called from a user gesture (click / key press). */
  async enable(): Promise<void> {
    if (!this.supported) return;
    const op = ++this.op;
    this.cancelSuspend();
    if (!this.context) {
      const ac = new AudioContext({ latencyHint: 'interactive' });
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      const master = ac.createGain();
      master.gain.value = 0;
      master.connect(comp).connect(ac.destination);
      this.context = ac;
      this.master = master;
    }
    await this.context.resume();
    if (op !== this.op) return; // turned off again while resuming
    this.rampMaster(MASTER_LEVEL);
    this.enabled$.next(true);
  }

  /**
   * Mute first, then suspend once ringing notes and already-queued hits have
   * played out silently. Suspending straight away would freeze them mid-note
   * and replay them the next time sound is switched on.
   */
  async disable(): Promise<void> {
    const op = ++this.op;
    this.enabled$.next(false);
    const ac = this.context;
    if (!ac) return;
    this.rampMaster(0);
    this.cancelSuspend();
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      if (op === this.op) void ac.suspend();
    }, SETTLE_MS);
  }

  toggle(): Promise<void> {
    return this.enabled ? this.disable() : this.enable();
  }

  private rampMaster(level: number): void {
    const ac = this.context;
    const gain = this.master?.gain;
    if (!ac || !gain) return;
    const t = ac.currentTime;
    gain.cancelScheduledValues(t);
    gain.setValueAtTime(gain.value, t);
    gain.setTargetAtTime(level, t, 0.04);
  }

  private cancelSuspend(): void {
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
  }
}
