import type p5 from 'p5';

/* Shared toolkit for the Offbeat p5 sketches.
 * Every sketch speaks the same visual language as the site:
 * Nord colours read from the live CSS tokens, square corners,
 * hard offset shadows, and time that runs on a lazy, swung beat.
 */

export interface OffbeatPalette {
  dark: boolean;
  bg: string;
  surface: string;
  raised: string;
  border: string;
  ink: string;
  muted: string;
  frost0: string;
  frost1: string;
  frost2: string;
  frost3: string;
  red: string;
  yellow: string;
  green: string;
  purple: string;
}

export interface SketchPointer {
  x: number;
  y: number;
  inside: boolean;
}

export interface SketchContext {
  seed: number;
  reducedMotion: boolean;
  pointer: SketchPointer;
  palette(): OffbeatPalette;
  /** Milliseconds since start; frozen at a fixed moment under reduced motion. */
  now(): number;
}

export interface SketchHooks {
  setup?(): void;
  draw(): void;
  resize?(): void;
  press?(x: number, y: number): void;
  themeChanged?(): void;
}

export type SketchFactory = (p: p5, ctx: SketchContext) => SketchHooks;

const FALLBACK: OffbeatPalette = {
  dark: true,
  bg: '#2E3440',
  surface: '#3B4252',
  raised: '#434C5E',
  border: '#4C566A',
  ink: '#D8DEE9',
  muted: '#9AA0AD',
  frost0: '#8FBCBB',
  frost1: '#88C0D0',
  frost2: '#81A1C1',
  frost3: '#5E81AC',
  red: '#BF616A',
  yellow: '#EBCB8B',
  green: '#A3BE8C',
  purple: '#B48EAD'
};

export function readPalette(el: Element): OffbeatPalette {
  const styles = getComputedStyle(el);
  const token = (name: string, fallback: string) => normalizeHex(styles.getPropertyValue(name)) ?? fallback;
  const bg = token('--background-color', FALLBACK.bg);

  return {
    dark: luminance(bg) < 0.5,
    bg,
    surface: token('--surface-color', FALLBACK.surface),
    raised: token('--elevated-surface', FALLBACK.raised),
    border: token('--border-color', FALLBACK.border),
    ink: token('--text-color', FALLBACK.ink),
    muted: token('--text-muted', FALLBACK.muted),
    frost0: token('--frost0', FALLBACK.frost0),
    frost1: token('--frost1', FALLBACK.frost1),
    frost2: token('--frost2', FALLBACK.frost2),
    frost3: token('--frost3', FALLBACK.frost3),
    red: token('--aurora-red', FALLBACK.red),
    yellow: token('--aurora-yellow', FALLBACK.yellow),
    green: token('--aurora-green', FALLBACK.green),
    purple: token('--aurora-purple', FALLBACK.purple)
  };
}

function normalizeHex(value: string): string | null {
  const raw = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return ('#' + raw.slice(1).split('').map(c => c + c).join('')).toUpperCase();
  }
  return null;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** CSS colour string with alpha, accepted by every p5 colour call. */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

/** Linear mix of two hex colours, returned as hex. */
export function mix(a: string, b: string, t: number): string {
  const ca = channels(a);
  const cb = channels(b);
  const k = Math.max(0, Math.min(1, t));
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return '#' + out.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Euclidean rhythm: spread `pulses` hits as evenly as possible over `steps`,
 * then rotate so the downbeat is no longer guaranteed — the offbeat part.
 */
export function euclid(pulses: number, steps: number, rotation = 0): boolean[] {
  return Array.from({ length: steps }, (_, i) => (((i + rotation) * pulses) % steps) < pulses);
}

export interface BeatPosition {
  /** Absolute sixteenth-note index since start. */
  step: number;
  /** 0 → 1 progress through the current sixteenth. */
  phase: number;
  /** True for the swung, late sixteenths. */
  offbeat: boolean;
}

/**
 * Sixteenth-note clock with swing. `swing` is the share of each pair
 * taken by the on-beat note: 0.5 is straight, 0.66 is a lazy shuffle.
 */
export function swungClock(ms: number, bpm: number, swing = 0.62): BeatPosition {
  const pair = 60000 / bpm / 2;
  const pairIndex = Math.floor(ms / pair);
  const within = (ms - pairIndex * pair) / pair;

  if (within < swing) {
    return { step: pairIndex * 2, phase: within / swing, offbeat: false };
  }
  return { step: pairIndex * 2 + 1, phase: (within - swing) / (1 - swing), offbeat: true };
}

/** A solid block with the signature Offbeat hard shadow. `lift` 0 = pressed flat. */
export function offsetBlock(
  p: p5,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  shadow: string,
  offset: number,
  border?: string,
  lift = 1
): void {
  const o = offset * lift;
  const press = offset - o;

  p.noStroke();
  if (o > 0.25) {
    p.fill(shadow);
    p.rect(x + offset, y + offset, w, h);
  }

  p.fill(fill);
  if (border) {
    p.stroke(border);
    p.strokeWeight(2);
  }
  p.rect(x + press, y + press, w, h);
  p.noStroke();
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
