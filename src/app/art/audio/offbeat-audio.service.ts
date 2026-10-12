import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/* One AudioContext for every Offbeat sketch on the page.
 * Browsers only allow audio after a user gesture, so sound starts off and
 * the context is created the first time the visitor turns it on. Each sketch
 * then hangs its own bus off `input`, which runs through a gentle compressor
 * so four studies playing at once never clip.
 */
@Injectable({ providedIn: 'root' })
export class OffbeatAudioService {
  readonly enabled$ = new BehaviorSubject(false);

  private context: AudioContext | null = null;
  private master: GainNode | null = null;

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
    if (!this.context) {
      const ac = new AudioContext({ latencyHint: 'interactive' });
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      const master = ac.createGain();
      master.gain.value = 0.7;
      master.connect(comp).connect(ac.destination);
      this.context = ac;
      this.master = master;
    }
    await this.context.resume();
    this.enabled$.next(true);
  }

  /** Suspending stops every sketch's sources, including the continuous wind. */
  async disable(): Promise<void> {
    this.enabled$.next(false);
    await this.context?.suspend();
  }

  toggle(): Promise<void> {
    return this.enabled ? this.disable() : this.enable();
  }
}
