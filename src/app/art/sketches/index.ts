import { SketchFactory } from '../offbeat-sketch';
import { euclidSequencer } from './euclid-sequencer';
import { flipTiles } from './flip-tiles';
import { lazyWaveform } from './lazy-waveform';
import { offbeatField } from './offbeat-field';
import { offsetDrift } from './offset-drift';

export type SketchId = 'syncopation' | 'drift' | 'waveform' | 'tiles' | 'field';

export const SKETCHES: Record<SketchId, SketchFactory> = {
  syncopation: euclidSequencer,
  drift: offsetDrift,
  waveform: lazyWaveform,
  tiles: flipTiles,
  field: offbeatField
};
