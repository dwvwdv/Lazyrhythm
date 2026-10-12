import type p5 from 'p5';
import { SketchFactory, offsetBlock, rgba, swungClock } from '../offbeat-sketch';
import { Plucker, createPlucker } from '../audio/instruments';

/* LAZY WAVEFORM — a stepped equaliser that refuses to move together.
 * Targets are sampled from slow, detuned sines, but even bars only listen
 * on the downbeat and odd bars only on the swung offbeat. Each bar then
 * eases toward its target lazily, and its peak cap falls under weak gravity.
 * The pointer acts as a lens that lifts nearby bars; click to retune.
 * Sound: the bars that jump highest on each step pluck a note (taller bar,
 * higher pitch) in a seeded timbre — plucked string, marimba or FM bell —
 * over a soft, syncopated bass.
 */

const BPM = 90;

interface Voice {
  freq: number;
  speed: number;
  phase: number;
  amp: number;
}

export const lazyWaveform: SketchFactory = (p: p5, ctx) => {
  let voices: Voice[] = [];
  let level: number[] = [];
  let target: number[] = [];
  let peak: number[] = [];
  let peakVel: number[] = [];
  let lastStep = -1;
  let plucker: Plucker | null = null;

  const voice = (): Plucker | null => {
    if (!ctx.audio.active) return null;
    return (plucker ??= createPlucker(ctx.audio.ac, ctx.audio.out, ctx.audio.rng));
  };

  /** Pluck the (at most two) bars that bounced up the most on this step. */
  const pluckJumps = (jumps: { height: number; jump: number }[], step: number) => {
    const synth = voice();
    if (!synth) return;
    const t = ctx.audio.ac.currentTime;
    jumps
      .filter(j => j.jump >= 2 / 12)
      .sort((a, b) => b.jump - a.jump)
      .slice(0, 2)
      .forEach((j, k) => synth.pluck(t + k * 0.03, j.height, 0.35 + j.jump * 2));
    if (step % 16 === 0) synth.bass(t, false);
    if (step % 16 === 6) synth.bass(t, true);
  };

  const tune = () => {
    voices = Array.from({ length: 3 }, (_, i) => ({
      freq: p.random(0.6, 2.4) * (i + 1),
      speed: p.random(0.15, 0.6) * (i % 2 ? -1 : 1),
      phase: p.random(p.TWO_PI),
      amp: 1 / (i + 1.4)
    }));
  };

  const barCount = () => Math.max(12, Math.floor(p.width / 18));

  const reset = () => {
    const n = barCount();
    level = new Array(n).fill(0.1);
    target = new Array(n).fill(0.1);
    peak = new Array(n).fill(0.1);
    peakVel = new Array(n).fill(0);
    lastStep = -1;
  };

  const sample = (i: number, n: number, t: number) => {
    const u = i / (n - 1);
    let v = 0;
    let norm = 0;
    for (const voice of voices) {
      v += Math.sin(u * voice.freq * p.TWO_PI + voice.phase + t * 0.001 * voice.speed) * voice.amp;
      norm += voice.amp;
    }
    const shaped = Math.pow((v / norm + 1) / 2, 1.6);
    return Math.round(shaped * 12) / 12; // quantised into 12 hard steps
  };

  return {
    setup() {
      tune();
      reset();
    },

    resize: () => reset(),

    press() {
      tune();
      // Resample every bar on the next frame; under reduced motion the frozen clock never advances a step.
      lastStep = -1;
      const synth = voice();
      if (synth) synth.sweep(ctx.audio.ac.currentTime);
    },

    draw() {
      const pal = ctx.palette();
      const t = ctx.now();
      const beat = swungClock(t, BPM, 0.62);
      const n = level.length;
      const dt = Math.min(p.deltaTime || 16, 64) / 16.67;

      if (beat.step !== lastStep) {
        const first = lastStep < 0;
        lastStep = beat.step;
        const jumps: { height: number; jump: number }[] = [];
        for (let i = first ? 0 : beat.offbeat ? 1 : 0; i < n; i += first ? 1 : 2) {
          const next = sample(i, n, t);
          jumps.push({ height: next, jump: next - target[i] });
          target[i] = next;
        }
        if (!first && !ctx.reducedMotion) pluckJumps(jumps, beat.step);
      }

      const pad = Math.max(14, p.width * 0.04);
      const unit = (p.width - pad * 2) / n;
      const gap = Math.max(3, unit * 0.28);
      const barW = unit - gap;
      const baseY = p.height - Math.max(26, p.height * 0.12);
      const maxH = baseY - Math.max(24, p.height * 0.1);
      const off = Math.max(3, Math.round(barW * 0.22));

      p.background(pal.bg);

      // Baseline rail with quarter ticks.
      p.noStroke();
      p.fill(pal.border);
      p.rect(pad, baseY + 6, p.width - pad * 2, 2);
      const beatInBar = Math.floor(beat.step / 4) % 4;
      for (let q = 0; q < 4; q++) {
        p.fill(q === beatInBar ? pal.frost1 : pal.border);
        p.rect(pad + q * ((p.width - pad * 2) / 4), baseY + 12, 14, 4);
      }

      for (let i = 0; i < n; i++) {
        let goal = target[i];
        if (ctx.pointer.inside) {
          const bx = pad + i * unit + barW / 2;
          const lens = Math.exp(-Math.pow((ctx.pointer.x - bx) / 80, 2));
          goal = Math.min(1, goal + lens * 0.45);
        }

        level[i] += (goal - level[i]) * (ctx.reducedMotion ? 1 : 0.09 * dt);
        const h = Math.max(4, level[i] * maxH);
        const x = pad + i * unit;
        const isOff = i % 2 === 1;

        offsetBlock(p, x, baseY - h, barW, h, isOff ? pal.frost2 : pal.frost1, pal.frost3, off);

        // Peak caps: pushed up instantly, fall back lazily.
        const top = level[i];
        if (top >= peak[i] || ctx.reducedMotion) {
          peak[i] = top;
          peakVel[i] = 0;
        } else {
          peakVel[i] += 0.0006 * dt;
          peak[i] = Math.max(top, peak[i] - peakVel[i] * dt);
        }
        const capY = baseY - Math.max(4, peak[i] * maxH) - 10;
        p.fill(isOff ? pal.yellow : pal.ink);
        p.rect(x, capY, barW, 4);
      }

      // A thin scanning reticle so the swing reads even in silence.
      const sweep = ((beat.step % 16) + beat.phase) / 16;
      p.fill(rgba(pal.frost1, 0.12));
      p.rect(pad + sweep * (p.width - pad * 2) - 1, baseY - maxH - 14, 2, maxH + 20);
    }
  };
};
