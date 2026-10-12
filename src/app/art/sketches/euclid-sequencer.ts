import type p5 from 'p5';
import { SketchFactory, euclid, offsetBlock, rgba, swungClock } from '../offbeat-sketch';

/* SYNCOPATION — a 16-step sequencer that plays rotated Euclidean rhythms.
 * Active steps are raised blocks; when the swung playhead hits one it is
 * pressed flat into its shadow, like a key on an Offbeat button.
 * Click a cell to toggle it.
 */

const STEPS = 16;
const BPM = 84;
const SWING = 0.64;

interface Track {
  pulses: number;
  rotation: number;
  pattern: boolean[];
  energy: number[];
  edited: boolean;
}

interface Echo {
  x: number;
  y: number;
  size: number;
  age: number;
  offbeat: boolean;
}

export const euclidSequencer: SketchFactory = (p: p5, ctx) => {
  const tracks: Track[] = [];
  const echoes: Echo[] = [];
  let lastStep = -1;
  let layout = { x: 0, y: 0, cell: 0, gap: 0, label: 0 };
  let hover: [number, number] | null = null;

  const computeLayout = () => {
    const pad = Math.max(16, Math.min(p.width, p.height) * 0.07);
    const label = p.width > 520 ? 78 : 0;
    const cols = STEPS;
    const rows = tracks.length;
    const unit = Math.min((p.width - pad * 2 - label) / cols, (p.height - pad * 2 - 18) / rows);
    const gap = Math.max(3, unit * 0.18);
    const cell = unit - gap;
    const gridW = unit * cols - gap;
    const gridH = unit * rows - gap;
    layout = {
      x: (p.width - gridW - label) / 2 + label,
      y: (p.height - gridH) / 2 + 9,
      cell,
      gap,
      label
    };
  };

  const cellAt = (mx: number, my: number): [number, number] | null => {
    const unit = layout.cell + layout.gap;
    const c = Math.floor((mx - layout.x) / unit);
    const r = Math.floor((my - layout.y) / unit);
    if (c < 0 || c >= STEPS || r < 0 || r >= tracks.length) return null;
    const inX = (mx - layout.x) - c * unit <= layout.cell;
    const inY = (my - layout.y) - r * unit <= layout.cell;
    return inX && inY ? [r, c] : null;
  };

  return {
    setup() {
      // As many tracks as fit at the width-limited cell size, 4–10.
      const unit = (p.width * 0.86 - (p.width > 520 ? 78 : 0)) / STEPS;
      const rows = Math.max(4, Math.min(10, Math.floor((p.height * 0.8) / unit)));
      for (let i = 0; i < rows; i++) {
        const pulses = Math.floor(p.random(2, 10));
        const rotation = Math.floor(p.random(STEPS));
        tracks.push({
          pulses,
          rotation,
          pattern: euclid(pulses, STEPS, rotation),
          energy: new Array(STEPS).fill(0),
          edited: false
        });
      }
      computeLayout();
    },

    resize: () => computeLayout(),

    press(x, y) {
      const hit = cellAt(x, y);
      if (!hit) return;
      const track = tracks[hit[0]];
      track.pattern[hit[1]] = !track.pattern[hit[1]];
      track.pulses = track.pattern.filter(Boolean).length;
      track.edited = true;
    },

    draw() {
      const pal = ctx.palette();
      const beat = swungClock(ctx.now(), BPM, SWING);
      const step = beat.step % STEPS;
      const dt = Math.min(p.deltaTime || 16, 64);
      const { x, y, cell, gap, label } = layout;
      const unit = cell + gap;
      const off = Math.max(2, Math.round(cell * 0.12));

      if (beat.step !== lastStep) {
        lastStep = beat.step;
        tracks.forEach((track, r) => {
          if (!track.pattern[step]) return;
          track.energy[step] = 1;
          if (!ctx.reducedMotion) {
            echoes.push({ x: x + step * unit, y: y + r * unit, size: cell, age: 0, offbeat: beat.offbeat });
          }
        });
      }

      hover = ctx.pointer.inside ? cellAt(ctx.pointer.x, ctx.pointer.y) : null;

      p.background(pal.bg);

      // Playhead column and the quarter-note ruler above the grid.
      p.noStroke();
      p.fill(rgba(pal.frost1, 0.08));
      p.rect(x + step * unit - gap / 2, y - gap / 2, unit, tracks.length * unit);
      for (let c = 0; c < STEPS; c++) {
        const isQuarter = c % 4 === 0;
        p.fill(c === step ? pal.frost1 : isQuarter ? pal.muted : pal.border);
        p.rect(x + c * unit, y - 12, isQuarter ? cell : Math.max(2, cell * 0.25), 3);
      }

      tracks.forEach((track, r) => {
        const rowY = y + r * unit;

        if (label) {
          p.fill(pal.muted);
          p.textFont('monospace');
          p.textSize(10);
          p.textAlign(p.LEFT, p.CENTER);
          const name = track.edited
            ? `USR ${track.pulses}/${STEPS}`
            : `E(${track.pulses},${STEPS})${track.rotation ? '+' + track.rotation : ''}`;
          p.text(name, x - label, rowY + cell / 2);
        }

        for (let c = 0; c < STEPS; c++) {
          const cx = x + c * unit;
          const e = track.energy[c];
          const isHover = hover !== null && hover[0] === r && hover[1] === c;

          if (track.pattern[c]) {
            // Odd sixteenths are the offbeats; they flash yellow instead of frost.
            const accent = c % 2 === 1 ? pal.yellow : pal.frost1;
            const lift = 1 - Math.min(1, e * 1.4);
            offsetBlock(p, cx, rowY, cell, cell, pal.raised, pal.frost3, off, isHover ? pal.frost1 : pal.border, lift);
            if (e > 0.02) {
              const press = off * (1 - lift);
              p.fill(rgba(accent, Math.sqrt(e)));
              p.rect(cx + press + 3, rowY + press + 3, cell - 6, cell - 6);
            }
          } else {
            p.noFill();
            p.stroke(isHover ? pal.frost1 : rgba(pal.border, 0.8));
            p.strokeWeight(isHover ? 2 : 1);
            const inset = cell * 0.32;
            p.rect(cx + inset, rowY + inset, cell - inset * 2, cell - inset * 2);
            p.noStroke();
          }

          track.energy[c] = e * Math.pow(0.0035, dt / 1000);
        }
      });

      // Square echoes drifting down-right, the direction of every Offbeat shadow.
      p.noFill();
      p.strokeWeight(2);
      for (let i = echoes.length - 1; i >= 0; i--) {
        const echo = echoes[i];
        echo.age += dt / 700;
        if (echo.age >= 1) {
          echoes.splice(i, 1);
          continue;
        }
        const grow = echo.age * cell * 0.9;
        const drift = echo.age * off * 3;
        p.stroke(rgba(echo.offbeat ? pal.yellow : pal.frost1, (1 - echo.age) * 0.55));
        p.rect(echo.x - grow / 2 + drift, echo.y - grow / 2 + drift, echo.size + grow, echo.size + grow);
      }
      p.noStroke();
    }
  };
};
