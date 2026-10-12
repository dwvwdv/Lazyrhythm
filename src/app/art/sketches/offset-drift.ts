import type p5 from 'p5';
import { SketchFactory, rgba, swungClock } from '../offbeat-sketch';
import { Wind, createWind } from '../audio/instruments';

/* OFFSET DRIFT — a lazy flow field quantised to 45° turns.
 * Every trail is drawn twice: once as a frost3 shadow pushed down-right,
 * once as the line itself. On each swung offbeat the field's grid of
 * allowed angles slips by 22.5°, so the whole drift kinks off the beat.
 * Trails are kept as short polylines and redrawn every frame, so the
 * canvas never smears and theme switches repaint cleanly.
 * Move the pointer to part the flow; click to reseed the field.
 * Sound: two bands of stereo wind plus a faint whistle tuned to the shared
 * scale. The wind's pitch flutters with the offbeat kinks, moving the
 * pointer whips up a gust, and a reseed blows through as a whoosh.
 */

const BPM = 72;
const NOISE_SCALE = 0.0024;
const TRAIL = 34;
const SPEED = 2.2;

interface Walker {
  xs: number[];
  ys: number[];
  life: number;
  tone: number;
}

export const offsetDrift: SketchFactory = (p: p5, ctx) => {
  let walkers: Walker[] = [];
  let zOffset = 0;
  let wind: Wind | null = null;
  let gust = 0;
  let lastPointer = { x: 0, y: 0 };

  const air = (): Wind | null => {
    if (!ctx.audio.active) return null;
    return (wind ??= createWind(ctx.audio.ac, ctx.audio.out, ctx.audio.rng));
  };

  // Faster pointer movement inside the canvas means a stronger gust.
  const steerWind = (kink: number) => {
    const { x, y, inside } = ctx.pointer;
    const speed = inside ? Math.hypot(x - lastPointer.x, y - lastPointer.y) : 0;
    lastPointer = { x, y };
    gust += (Math.min(1, speed / 30) - gust) * 0.12;
    air()?.steer(gust, kink !== 0);
  };

  const spawn = (w: Walker) => {
    const x = p.random(p.width);
    const y = p.random(p.height);
    w.xs = [x];
    w.ys = [y];
    w.life = p.random(90, 280);
    w.tone = p.random();
  };

  const populate = () => {
    const count = Math.min(420, Math.floor((p.width * p.height) / 900));
    walkers = Array.from({ length: count }, () => {
      const w: Walker = { xs: [], ys: [], life: 0, tone: 0 };
      spawn(w);
      return w;
    });
    // Reduced motion gets one settled composition instead of an animation.
    if (ctx.reducedMotion) {
      for (let i = 0; i < TRAIL; i++) advance(i * 140, (i >> 3) % 2 ? Math.PI / 8 : 0);
    }
  };

  const advance = (t: number, kink: number) => {
    const quant = p.QUARTER_PI;

    for (const w of walkers) {
      const x = w.xs[w.xs.length - 1];
      const y = w.ys[w.ys.length - 1];
      const n = p.noise(x * NOISE_SCALE, y * NOISE_SCALE, t * 0.00005 + zOffset);
      let angle = Math.round((n * p.TWO_PI * 2 - kink) / quant) * quant + kink;

      if (ctx.pointer.inside) {
        const dx = x - ctx.pointer.x;
        const dy = y - ctx.pointer.y;
        if (dx * dx + dy * dy < 110 * 110) {
          angle = Math.round(Math.atan2(dy, dx) / quant) * quant;
        }
      }

      const nx = x + Math.cos(angle) * SPEED;
      const ny = y + Math.sin(angle) * SPEED;
      w.xs.push(nx);
      w.ys.push(ny);
      if (w.xs.length > TRAIL) {
        w.xs.shift();
        w.ys.shift();
      }

      w.life -= 1;
      if (w.life <= 0 || nx < -40 || nx > p.width + 40 || ny < -40 || ny > p.height + 40) spawn(w);
    }
  };

  const trace = (w: Walker, dx: number) => {
    p.beginShape();
    for (let i = 0; i < w.xs.length; i++) p.vertex(w.xs[i] + dx, w.ys[i] + dx);
    p.endShape();
  };

  return {
    setup: () => populate(),
    resize: () => populate(),

    dispose() {
      wind?.stop();
    },

    press() {
      const w = air();
      if (w) w.whoosh(ctx.audio.ac.currentTime);
      p.noiseSeed(Math.floor(p.random(1e9)));
      zOffset += 10;
      populate();
    },

    draw() {
      const pal = ctx.palette();
      const t = ctx.now();

      if (!ctx.reducedMotion) {
        const beat = swungClock(t, BPM, 0.66);
        const kink = beat.offbeat ? Math.PI / 8 : 0;
        advance(t, kink);
        steerWind(kink);
      }

      p.background(pal.bg);
      p.noFill();
      p.strokeCap(p.SQUARE);
      p.strokeJoin(p.MITER);
      p.strokeWeight(2);

      // Light mode flips the roles: deep frost lines over a pale frost shadow.
      const tones = pal.dark ? [pal.frost1, pal.frost0, pal.frost2] : [pal.frost3, pal.border, pal.frost2];
      p.stroke(pal.dark ? rgba(pal.frost3, 0.55) : rgba(pal.frost1, 0.5));
      for (const w of walkers) if (w.xs.length > 1) trace(w, 3);

      for (const w of walkers) {
        if (w.xs.length < 2) continue;
        const colour = w.tone < 0.04 ? pal.purple : w.tone < 0.55 ? tones[0] : w.tone < 0.8 ? tones[1] : tones[2];
        // Fade in as a trail is born and out as it dies, so respawns do not pop.
        const fade = Math.min(1, w.xs.length / TRAIL, w.life / 30);
        p.stroke(rgba(colour, 0.9 * fade));
        trace(w, 0);
      }
      p.noStroke();
    }
  };
};
