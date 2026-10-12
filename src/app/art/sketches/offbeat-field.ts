import type p5 from 'p5';
import { SketchFactory, rgba, swungClock } from '../offbeat-sketch';

/* OFFBEAT FIELD — the home hero backdrop.
 * A quiet dot grid. Every downbeat sends a square shock front out from one
 * corner; every swung offbeat answers from the opposite side. Dots the
 * fronts pass over lift into small blocks with an offset shadow.
 * Chebyshev distance keeps the fronts square instead of round.
 */

const BPM = 68;
const SPACING = 30;
const SPEED = 0.42; // px per ms
const BAND = 46;

interface Pulse {
  x: number;
  y: number;
  t0: number;
  offbeat: boolean;
}

export const offbeatField: SketchFactory = (p: p5, ctx) => {
  const pulses: Pulse[] = [];
  let lastStep = -1;

  const origin = (offbeat: boolean): [number, number] => {
    const jitter = () => p.random(-0.15, 0.15);
    return offbeat
      ? [p.width * (0.95 + jitter() * 0.3), p.height * (0.1 + jitter())]
      : [p.width * (0.45 + jitter()), p.height * (0.95 + jitter() * 0.3)];
  };

  return {
    draw() {
      const pal = ctx.palette();
      const now = ctx.now();
      const beat = swungClock(now, BPM, 0.66);

      if (beat.step !== lastStep) {
        lastStep = beat.step;
        const isDown = !beat.offbeat && beat.step % 4 === 0;
        const isAnswer = beat.offbeat && beat.step % 8 === 3;
        if (isDown || isAnswer || ctx.reducedMotion) {
          const [x, y] = origin(!isDown);
          pulses.push({ x, y, t0: ctx.reducedMotion ? now - 900 : now, offbeat: !isDown });
        }
      }

      const reach = Math.max(p.width, p.height) * 1.2;
      for (let i = pulses.length - 1; i >= 0; i--) {
        if ((now - pulses[i].t0) * SPEED > reach) pulses.splice(i, 1);
      }

      p.background(pal.bg);
      p.noStroke();

      const cols = Math.ceil(p.width / SPACING) + 1;
      const rows = Math.ceil(p.height / SPACING) + 1;
      const shiftX = (p.width - (cols - 1) * SPACING) / 2;
      const shiftY = (p.height - (rows - 1) * SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = shiftX + c * SPACING;
          const y = shiftY + r * SPACING;
          let energy = 0;
          let offbeat = false;

          for (const pulse of pulses) {
            const front = (now - pulse.t0) * SPEED;
            const d = Math.max(Math.abs(x - pulse.x), Math.abs(y - pulse.y));
            const fade = 1 - Math.min(1, front / reach);
            const e = Math.exp(-Math.pow((d - front) / BAND, 2)) * fade;
            if (e > energy) {
              energy = e;
              offbeat = pulse.offbeat;
            }
          }

          if (ctx.pointer.inside) {
            const d = Math.max(Math.abs(x - ctx.pointer.x), Math.abs(y - ctx.pointer.y));
            energy = Math.max(energy, Math.exp(-Math.pow(d / 70, 2)) * 0.9);
          }

          if (energy < 0.06) {
            p.fill(rgba(pal.muted, 0.28));
            p.rect(x - 1.5, y - 1.5, 3, 3);
            continue;
          }

          const size = 3 + energy * 9;
          const off = energy * 4;
          const colour = offbeat ? pal.frost0 : pal.frost1;
          p.fill(rgba(pal.frost3, 0.25 + energy * 0.6));
          p.rect(x - size / 2 + off, y - size / 2 + off, size, size);
          p.fill(rgba(colour, 0.3 + energy * 0.7));
          p.rect(x - size / 2, y - size / 2, size, size);
        }
      }
    }
  };
};
