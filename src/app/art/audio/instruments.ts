/* Offbeat instruments — everything is synthesised with Web Audio, no samples.
 *
 * Each sketch owns one instrument on its own bus. All pitched sounds share
 * D minor pentatonic, so any mix of the four studies stays consonant, while
 * each instrument's seed picks its timbre, register, decay and stereo spread.
 * Reroll a sketch and its sound is rerolled with it.
 */

export type Rng = () => number;

const PENTATONIC = [0, 3, 5, 7, 10];
const ROOT_HZ = 146.83; // D3

/** Frequency of a scale degree (0 = D3), wrapping into higher octaves. */
export function scaleHz(degree: number, octave = 0): number {
  const n = PENTATONIC.length;
  const oct = Math.floor(degree / n) + octave;
  const semis = PENTATONIC[((degree % n) + n) % n] + 12 * oct;
  return ROOT_HZ * Math.pow(2, semis / 12);
}

const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
const range = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ac: BaseAudioContext): AudioBuffer {
  let buffer = noiseCache.get(ac);
  if (!buffer) {
    buffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseCache.set(ac, buffer);
  }
  return buffer;
}

/** White noise from a random point in the shared buffer; `endless` runs until stopped. */
function noise(ac: BaseAudioContext, when: number, duration: number, endless = false): AudioBufferSourceNode {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  // Always loop so a long burst (the 1.2s whoosh) never runs off the end of the 2s buffer.
  src.loop = true;
  src.start(when, Math.random() * 1.5);
  if (!endless) src.stop(when + duration + 0.05);
  return src;
}

/** Percussive gain envelope: fast attack, exponential decay. */
function hitEnvelope(ac: BaseAudioContext, when: number, peak: number, decay: number, attack = 0.002): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), when + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  return g;
}

function panned(ac: BaseAudioContext, out: AudioNode, pan: number): AudioNode {
  const p = ac.createStereoPanner();
  p.pan.value = pan;
  p.connect(out);
  return p;
}

function tone(
  ac: BaseAudioContext,
  dest: AudioNode,
  type: OscillatorType,
  freq: number,
  when: number,
  peak: number,
  decay: number,
  dropTo?: number
): void {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (dropTo) osc.frequency.exponentialRampToValueAtTime(dropTo, when + Math.min(0.14, decay));
  const env = hitEnvelope(ac, when, peak, decay);
  osc.connect(env).connect(dest);
  osc.start(when);
  osc.stop(when + decay + 0.05);
}

/** Two-operator FM voice; gives bells, glass and metallic blips. */
function fm(
  ac: BaseAudioContext,
  dest: AudioNode,
  freq: number,
  ratio: number,
  index: number,
  when: number,
  peak: number,
  decay: number
): void {
  const carrier = ac.createOscillator();
  const mod = ac.createOscillator();
  const modGain = ac.createGain();
  carrier.frequency.value = freq;
  mod.frequency.value = freq * ratio;
  modGain.gain.setValueAtTime(freq * index, when);
  modGain.gain.exponentialRampToValueAtTime(freq * 0.05 + 0.01, when + decay);
  mod.connect(modGain).connect(carrier.frequency);
  const env = hitEnvelope(ac, when, peak, decay);
  carrier.connect(env).connect(dest);
  carrier.start(when);
  mod.start(when);
  carrier.stop(when + decay + 0.05);
  mod.stop(when + decay + 0.05);
}

function filteredNoise(
  ac: BaseAudioContext,
  dest: AudioNode,
  type: BiquadFilterType,
  freq: number,
  q: number,
  when: number,
  peak: number,
  decay: number
): void {
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = hitEnvelope(ac, when, peak, decay);
  noise(ac, when, decay).connect(filter).connect(env).connect(dest);
}

/* ───────────────────────── Syncopation: drum kit ───────────────────────── */

type DrumKind = 'kick' | 'snare' | 'hat' | 'rim' | 'tom' | 'blip';

export interface DrumKit {
  /** Play one track's voice. Offbeat hits are accented, the Offbeat signature. */
  hit(track: number, when: number, offbeat: boolean): void;
}

export function createDrumKit(ac: BaseAudioContext, out: AudioNode, rng: Rng, tracks: number): DrumKit {
  const pool: DrumKind[] = ['kick', 'hat', 'snare', 'rim', 'tom', 'blip', 'hat', 'blip', 'tom', 'rim'];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const voices = Array.from({ length: tracks }, (_, i) => {
    const kind = pool[i % pool.length];
    const degree = Math.floor(rng() * 10);
    const decay = range(rng, 0.6, 1.6);
    const bright = range(rng, 0.7, 1.4);
    const ratio = pick(rng, [2, 3.5, 1.5]);
    const dest = panned(ac, out, kind === 'kick' ? 0 : range(rng, -0.7, 0.7));

    return (when: number, vel: number) => {
      switch (kind) {
        case 'kick':
          tone(ac, dest, 'sine', 150 * bright, when, 0.9 * vel, 0.32 * decay, 42);
          break;
        case 'snare':
          filteredNoise(ac, dest, 'bandpass', 1800 * bright, 0.9, when, 0.5 * vel, 0.16 * decay);
          tone(ac, dest, 'triangle', 190, when, 0.25 * vel, 0.08);
          break;
        case 'hat':
          filteredNoise(ac, dest, 'highpass', 7000 * bright, 0.7, when, 0.22 * vel, (decay > 1.3 ? 0.22 : 0.045) * decay);
          break;
        case 'rim':
          filteredNoise(ac, dest, 'bandpass', scaleHz(degree, 3), 6, when, 0.45 * vel, 0.035);
          tone(ac, dest, 'square', scaleHz(degree, 2), when, 0.06 * vel, 0.03);
          break;
        case 'tom':
          tone(ac, dest, 'sine', scaleHz(degree, -1) * 1.6, when, 0.55 * vel, 0.28 * decay, scaleHz(degree, -1));
          break;
        case 'blip':
          fm(ac, dest, scaleHz(degree, 2), ratio, 2.2 * bright, when, 0.16 * vel, 0.18 * decay);
          break;
      }
    };
  });

  return {
    hit(track, when, offbeat) {
      voices[track % voices.length]?.(when, offbeat ? 0.8 : 0.5);
    }
  };
}

/* ───────────────────────── Offbeat Tiles: clacker ───────────────────────── */

export interface Clacker {
  /** One tile landing; `degree` sets its pitch so waves of flips play arpeggios. */
  clack(when: number, degree: number, vel: number): void;
}

export function createClacker(ac: BaseAudioContext, out: AudioNode, rng: Rng): Clacker {
  const material = pick(rng, ['wood', 'glass', 'metal'] as const);
  const body = range(rng, 900, 2400);
  const octave = pick(rng, [1, 2]);
  const ring = range(rng, 0.7, 1.4);
  const spread = range(rng, 0.2, 0.8);

  return {
    clack(when, step, level) {
      const vel = level * 1.5;
      const degree = step % 7; // keep the glass partials well under Nyquist
      const dest = panned(ac, out, (rng() * 2 - 1) * spread);
      switch (material) {
        case 'wood':
          filteredNoise(ac, dest, 'bandpass', body, 4, when, 0.5 * vel, 0.045);
          tone(ac, dest, 'sine', scaleHz(degree, octave), when, 0.32 * vel, 0.09 * ring);
          break;
        case 'glass':
          tone(ac, dest, 'sine', scaleHz(degree, octave + 1), when, 0.12 * vel, 0.35 * ring);
          tone(ac, dest, 'sine', scaleHz(degree, octave + 1) * 2.76, when, 0.04 * vel, 0.12 * ring);
          filteredNoise(ac, dest, 'highpass', 5000, 0.7, when, 0.08 * vel, 0.015);
          break;
        case 'metal':
          fm(ac, dest, scaleHz(degree, octave + 1), 1.41, 3, when, 0.1 * vel, 0.45 * ring);
          filteredNoise(ac, dest, 'bandpass', body * 2, 8, when, 0.2 * vel, 0.02);
          break;
      }
    }
  };
}

/* ───────────────────────── Lazy Waveform: plucks ───────────────────────── */

export interface Plucker {
  /** A bar bouncing up; `height` 0–1 sets pitch, `vel` how hard it jumped. */
  pluck(when: number, height: number, vel: number): void;
  /** Soft root note that marks the start of each bar. */
  bass(when: number, fifth: boolean): void;
  /** Rising arpeggio for a retune click. */
  sweep(when: number): void;
}

export function createPlucker(ac: BaseAudioContext, out: AudioNode, rng: Rng): Plucker {
  const timbre = pick(rng, ['pluck', 'marimba', 'bell'] as const);
  const span = Math.floor(range(rng, 8, 13));
  const base = Math.floor(range(rng, 0, 5));
  const decay = range(rng, 0.7, 1.4);
  const withBass = rng() < 0.75;

  const play = (when: number, degree: number, vel: number, pan: number) => {
    const dest = panned(ac, out, pan);
    const freq = scaleHz(degree, 1);
    switch (timbre) {
      case 'pluck': {
        const osc = ac.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 4;
        filter.frequency.setValueAtTime(800 + 3200 * vel, when);
        filter.frequency.exponentialRampToValueAtTime(220, when + 0.3 * decay);
        const env = hitEnvelope(ac, when, 0.22 * vel, 0.45 * decay);
        osc.connect(filter).connect(env).connect(dest);
        osc.start(when);
        osc.stop(when + 0.5 * decay + 0.05);
        break;
      }
      case 'marimba':
        tone(ac, dest, 'sine', freq, when, 0.35 * vel, 0.55 * decay);
        tone(ac, dest, 'sine', freq * 4, when, 0.08 * vel, 0.08);
        break;
      case 'bell':
        fm(ac, dest, freq * 2, 3.01, 1.6, when, 0.12 * vel, 1.1 * decay);
        break;
    }
  };

  return {
    pluck(when, height, vel) {
      play(when, base + Math.round(height * span), Math.min(1, vel), height * 1.2 - 0.6);
    },
    bass(when, fifth) {
      if (!withBass) return;
      tone(ac, out, 'sine', scaleHz(fifth ? 3 : 0, -1), when, 0.3, 1.4 * decay);
    },
    sweep(when) {
      for (let i = 0; i < 5; i++) play(when + i * 0.07, base + i * 2, 0.7, -0.5 + i * 0.25);
    }
  };
}

/* ───────────────────────── Offset Drift: wind ───────────────────────── */

export interface Wind {
  /** Steer the wind each frame: `gust` 0–1 from the pointer, `kink` on offbeats. */
  steer(gust: number, kink: boolean): void;
  /** A burst of air for a reseed click. */
  whoosh(when: number): void;
  stop(): void;
}

export function createWind(ac: BaseAudioContext, out: AudioNode, rng: Rng): Wind {
  const now = ac.currentTime;
  const baseL = range(rng, 280, 700);
  const baseR = baseL * range(rng, 1.2, 1.8);
  const q = range(rng, 0.6, 2.2);
  const whistleDegree = Math.floor(range(rng, 0, 10));
  const sources: AudioScheduledSourceNode[] = [];

  const layer = (freq: number, pan: number) => {
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    // A second, lowpass stage takes the hiss off so it reads as air, not static.
    const soften = ac.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = freq * 2.2;
    soften.Q.value = 0.5;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 1.2);
    const src = noise(ac, now, 0, true);
    src.connect(filter).connect(soften).connect(gain).connect(panned(ac, out, pan));
    sources.push(src);
    return { filter, soften, gain, freq };
  };

  const left = layer(baseL, -0.55);
  const right = layer(baseR, 0.55);

  // A faint resonant whistle, tuned to the shared scale, breathing on a slow LFO.
  const whistleFilter = ac.createBiquadFilter();
  whistleFilter.type = 'bandpass';
  whistleFilter.frequency.value = scaleHz(whistleDegree, 2);
  whistleFilter.Q.value = 28;
  const whistleGain = ac.createGain();
  whistleGain.gain.value = 0.05;
  const lfo = ac.createOscillator();
  const lfoDepth = ac.createGain();
  lfo.frequency.value = range(rng, 0.04, 0.12);
  lfoDepth.gain.value = 0.045;
  lfo.connect(lfoDepth).connect(whistleGain.gain);
  const whistleSrc = noise(ac, now, 0, true);
  whistleSrc.connect(whistleFilter).connect(whistleGain).connect(out);
  lfo.start(now);
  sources.push(whistleSrc, lfo);

  let lastGust = -1;
  let lastKink: boolean | null = null;

  return {
    steer(gust, kink) {
      if (Math.abs(gust - lastGust) < 0.02 && kink === lastKink) return;
      lastGust = gust;
      lastKink = kink;
      const t = ac.currentTime;
      const lift = (1 + gust * 0.9) * (kink ? 1.3 : 1);
      for (const l of [left, right]) {
        l.filter.frequency.setTargetAtTime(l.freq * lift, t, 0.09);
        l.soften.frequency.setTargetAtTime(l.freq * lift * 2.2, t, 0.09);
        l.gain.gain.setTargetAtTime(0.18 + gust * 0.3, t, 0.2);
      }
    },
    whoosh(when) {
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(baseL, when);
      filter.frequency.exponentialRampToValueAtTime(baseL * 6, when + 0.35);
      filter.frequency.exponentialRampToValueAtTime(baseL * 0.8, when + 1.1);
      const env = ac.createGain();
      env.gain.setValueAtTime(0.0001, when);
      env.gain.exponentialRampToValueAtTime(0.45, when + 0.25);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 1.2);
      noise(ac, when, 1.2).connect(filter).connect(env).connect(out);
    },
    stop() {
      const t = ac.currentTime;
      for (const src of sources) {
        try {
          src.stop(t + 0.1);
        } catch {
          // already stopped
        }
      }
    }
  };
}
