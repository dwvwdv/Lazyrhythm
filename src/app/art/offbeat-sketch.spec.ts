import { euclid, mix, rgba, swungClock } from './offbeat-sketch';

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
});
