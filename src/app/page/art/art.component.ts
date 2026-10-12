import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { P5CanvasComponent } from '../../widgets/p5-canvas/p5-canvas.component';
import { SketchId } from '../../art/sketches';

interface Study {
  id: Exclude<SketchId, 'field'>;
  tempo: string;
  seed: number;
}

const randomSeed = () => Math.floor(Math.random() * 0xffffff);

@Component({
  selector: 'app-art',
  imports: [CommonModule, TranslatePipe, P5CanvasComponent],
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.scss']
})
export class ArtComponent {
  studies: Study[] = [
    { id: 'syncopation', tempo: '84 BPM · SWING 64%', seed: randomSeed() },
    { id: 'drift', tempo: '72 BPM · SWING 66%', seed: randomSeed() },
    { id: 'waveform', tempo: '90 BPM · SWING 62%', seed: randomSeed() },
    { id: 'tiles', tempo: '76 BPM · SWING 64%', seed: randomSeed() }
  ];

  reroll(study: Study): void {
    study.seed = randomSeed();
  }

  hex(seed: number): string {
    return '0x' + seed.toString(16).toUpperCase().padStart(6, '0');
  }
}
