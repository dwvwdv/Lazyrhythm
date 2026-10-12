import { beatsBetween, euclid, mix, rgba, seededRandom, swungClock } from './offbeat-sketch';
import { scaleHz } from './audio/instruments';

describe('offbeat-sketch helpers', () => {
  it('spreads Euclidean pulses evenly', () => {
    const pattern = euclid(4, 16);
    expect(pattern.filter(Boolean).length).toBe(4);
    expect(pattern.map((hit, i) => (hit ? i : -1)).filter(i => i >= 0)).toEqual([0, 4, 8, 12]);
  });

  it('keeps the pulse count when rotated', () => {
    expect(euclid(5, 16, 3).filter(Boolean).length).toBe(5);
    expect(euclid(5, 16, 3)).not.toEqual(euclid(5, 16));
  });

  it('delays the offbeat sixteenth by the swing ratio', () => {
    // 60 BPM: one eighth-note pair lasts 500ms.
    expect(swungClock(0, 60, 0.5).offbeat).toBeFalse();
    expect(swungClock(260, 60, 0.5)).toEqual(jasmine.objectContaining({ step: 1, offbeat: true }));
    // With 66% swing the offbeat has not landed yet at 260ms.
    expect(swungClock(260, 60, 0.66)).toEqual(jasmine.objectContaining({ step: 0, offbeat: false }));
    expect(swungClock(340, 60, 0.66)).toEqual(jasmine.objectContaining({ step: 1, offbeat: true }));
    expect(swungClock(500, 60, 0.66).step).toBe(2);
  });

  it('formats Nord colours for p5', () => {
    expect(rgba('#88C0D0', 0.5)).toBe('rgba(136,192,208,0.500)');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('lists swung sixteenths inside a window', () => {
    // 60 BPM, 66% swing: steps start at 0, 330, 500, 830, 1000ms.
    const beats = beatsBetween(0, 1000, 60, 0.66);
    expect(beats.map(b => b.step)).toEqual([1, 2, 3, 4]);
    expect(beats.map(b => b.at)).toEqual([330, 500, 830, 1000]);
    expect(beats.map(b => b.offbeat)).toEqual([true, false, true, false]);
    // Contiguous windows never schedule a step twice.
    const split = [...beatsBetween(0, 600, 60, 0.66), ...beatsBetween(600, 1000, 60, 0.66)];
    expect(split.map(b => b.step)).toEqual([1, 2, 3, 4]);
  });

  it('keeps the sound seed stream deterministic', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seededRandom(43)()).not.toBe(seededRandom(42)());
  });

  it('maps scale degrees onto D minor pentatonic', () => {
    expect(scaleHz(0)).toBeCloseTo(146.83, 1);
    expect(scaleHz(5)).toBeCloseTo(293.66, 1); // one octave up
    expect(scaleHz(3)).toBeCloseTo(220, 0); // A3, the fifth
  });
});
