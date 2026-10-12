import type p5 from 'p5';
import { SketchFactory, easeOutBack, rgba, swungClock } from '../offbeat-sketch';

/* OFFBEAT TILES — a brutalist Truchet floor that rearranges itself on the beat.
 * Each tile is half solid, half void. On downbeats a diagonal wave of tiles
 * flips a quarter turn; on swung offbeats a few strays flip on their own.
 * A flipping tile lifts off its frost3 shadow and drops back down.
 * Hover to nudge a tile; click to flip a cross of them.
 */

const BPM = 76;
const FLIP_MS = 320;

interface Tile {
  turn: number;
  from: number;
  start: number;
  tone: number;
}

export const flipTiles: SketchFactory = (p: p5, ctx) => {
  let tiles: Tile[] = [];
  let cols = 0;
  let rows = 0;
  let size = 0;
  let ox = 0;
  let oy = 0;
  let lastStep = -1;
  let lastHover = -1;
  let wave = 0;

  const build = () => {
    size = Math.max(36, Math.min(72, Math.min(p.width, p.height) / 7));
    cols = Math.floor((p.width - 16) / size);
    rows = Math.floor((p.height - 16) / size);
    ox = (p.width - cols * size) / 2;
    oy = (p.height - rows * size) / 2;
    tiles = Array.from({ length: cols * rows }, () => ({
      turn: Math.floor(p.random(4)),
      from: 0,
      start: -1e9,
      tone: p.random()
    }));
    tiles.forEach(tile => (tile.from = tile.turn));
  };

  const flip = (index: number, now: number) => {
    const tile = tiles[index];
    if (!tile || now - tile.start < FLIP_MS) return;
    tile.from = tile.turn;
    tile.turn = tile.turn + 1;
    tile.start = now;
    // Reduced motion: land on the final orientation instead of animating to it.
    if (ctx.reducedMotion) {
      tile.from = tile.turn;
      tile.start = -1e9;
    }
  };

  const indexAt = (x: number, y: number) => {
    const c = Math.floor((x - ox) / size);
    const r = Math.floor((y - oy) / size);
    return c >= 0 && c < cols && r >= 0 && r < rows ? r * cols + c : -1;
  };

  return {
    setup: () => build(),
    resize: () => build(),

    press(x, y) {
      const i = indexAt(x, y);
      if (i < 0) return;
      const now = ctx.now();
      const c = i % cols;
      const r = Math.floor(i / cols);
      [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const cc = c + dc;
        const rr = r + dr;
        if (cc >= 0 && cc < cols && rr >= 0 && rr < rows) flip(rr * cols + cc, now);
      });
    },

    draw() {
      const pal = ctx.palette();
      const now = ctx.now();
      const beat = swungClock(now, BPM, 0.64);

      if (beat.step !== lastStep && !ctx.reducedMotion) {
        lastStep = beat.step;
        if (!beat.offbeat && beat.step % 4 === 0) {
          // Downbeat: one diagonal of the grid turns together.
          const diagonals = cols + rows - 1;
          const d = wave % diagonals;
          for (let r = 0; r < rows; r++) {
            const c = d - r;
            if (c >= 0 && c < cols) flip(r * cols + c, now);
          }
          wave += Math.floor(p.random(1, 4));
        } else if (beat.offbeat) {
          for (let k = 0; k < Math.max(1, Math.floor(tiles.length / 40)); k++) {
            flip(Math.floor(p.random(tiles.length)), now);
          }
        }
      }

      if (ctx.pointer.inside) {
        const i = indexAt(ctx.pointer.x, ctx.pointer.y);
        if (i !== lastHover && i >= 0) flip(i, now);
        lastHover = i;
      } else {
        lastHover = -1;
      }

      p.background(pal.bg);
      const off = Math.max(3, Math.round(size * 0.08));
      const inset = 3;
      const s = size - inset * 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = tiles[r * cols + c];
          const k = Math.min(1, (now - tile.start) / FLIP_MS);
          const angle = (tile.from + (tile.turn - tile.from) * easeOutBack(k)) * p.HALF_PI;
          const lift = k < 1 ? Math.sin(k * Math.PI) : 0;
          const cx = ox + c * size + size / 2;
          const cy = oy + r * size + size / 2;
          const solid = tile.tone < 0.08 ? pal.yellow : (r + c) % 2 ? pal.frost3 : pal.frost1;

          p.noStroke();
          p.fill(rgba(pal.frost3, lift > 0 ? 0.9 : 0.55));
          p.rect(cx - s / 2 + off * (1 + lift), cy - s / 2 + off * (1 + lift), s, s);

          p.push();
          p.translate(cx - lift * off, cy - lift * off);
          p.rotate(angle);
          p.fill(pal.surface);
          p.stroke(pal.border);
          p.strokeWeight(2);
          p.rect(-s / 2, -s / 2, s, s);
          p.noStroke();
          p.fill(solid);
          p.triangle(-s / 2 + 1, -s / 2 + 1, s / 2 - 1, -s / 2 + 1, -s / 2 + 1, s / 2 - 1);
          p.pop();
        }
      }
    }
  };
};
