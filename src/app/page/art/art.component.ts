import { Component, OnDestroy, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { P5CanvasComponent } from '../../widgets/p5-canvas/p5-canvas.component';
import { SketchId } from '../../art/sketches';
import { OffbeatAudioService } from '../../art/audio/offbeat-audio.service';

interface Study {
  id: Exclude<SketchId, 'field'>;
  tempo: string;
  seed: number;
  muted: boolean;
}

const randomSeed = () => Math.floor(Math.random() * 0xffffff);
const MOTION_KEY = 'artMotion';

@Component({
  selector: 'app-art',
  imports: [CommonModule, TranslatePipe, P5CanvasComponent],
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.scss']
})
export class ArtComponent implements OnDestroy {
  studies: Study[] = [
    { id: 'syncopation', tempo: '84 BPM · SWING 64%', seed: randomSeed(), muted: false },
    { id: 'drift', tempo: '72 BPM · SWING 66%', seed: randomSeed(), muted: false },
    { id: 'waveform', tempo: '90 BPM · SWING 62%', seed: randomSeed(), muted: false },
    { id: 'tiles', tempo: '76 BPM · SWING 64%', seed: randomSeed(), muted: false }
  ];

  /** The system asks for reduced motion, so the studies start as still frames. Browser only. */
  readonly reducedMotion = signal(false);
  /** The visitor chose to animate the studies anyway. */
  readonly playMotion = signal(false);

  private motionQuery?: MediaQueryList;

  constructor(readonly audio: OffbeatAudioService) {
    afterNextRender(() => {
      // The canvases follow later changes on their own; keep the control in step with them.
      this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
      this.motionQuery.addEventListener('change', this.onMotionChange);
      this.reducedMotion.set(this.motionQuery.matches);
      try {
        this.playMotion.set(localStorage.getItem(MOTION_KEY) === 'on');
      } catch {
        // Without storage the studies start still on every visit.
      }
    });
  }

  toggleMotion(): void {
    const play = !this.playMotion();
    this.playMotion.set(play);
    try {
      if (play) localStorage.setItem(MOTION_KEY, 'on');
      else localStorage.removeItem(MOTION_KEY);
    } catch {
      // The choice still holds for this visit.
    }
  }

  toggleSound(): void {
    void this.audio.toggle();
  }

  // Sound belongs to this page; leaving it switches sound off so the toggle never lies on return.
  ngOnDestroy(): void {
    void this.audio.disable();
    this.motionQuery?.removeEventListener('change', this.onMotionChange);
  }

  private onMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion.set(event.matches);
  };

  reroll(study: Study): void {
    study.seed = randomSeed();
  }

  hex(seed: number): string {
    return '0x' + seed.toString(16).toUpperCase().padStart(6, '0');
  }
}
