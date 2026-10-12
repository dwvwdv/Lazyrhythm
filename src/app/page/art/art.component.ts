import { Component, OnDestroy } from '@angular/core';
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

  constructor(readonly audio: OffbeatAudioService) {}

  toggleSound(): void {
    void this.audio.toggle();
  }

  // Sound belongs to this page; leaving it switches sound off so the toggle never lies on return.
  ngOnDestroy(): void {
    void this.audio.disable();
  }

  reroll(study: Study): void {
    study.seed = randomSeed();
  }

  hex(seed: number): string {
    return '0x' + seed.toString(16).toUpperCase().padStart(6, '0');
  }
}
