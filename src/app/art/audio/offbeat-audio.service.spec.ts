import { OffbeatAudioService } from './offbeat-audio.service';

/** Minimal stand-in for AudioContext: records suspend calls and lets tests control resume(). */
class FakeAudioContext {
  static last: FakeAudioContext;
  currentTime = 0;
  destination = {};
  suspended = 0;
  resolveResume: () => void = () => undefined;

  constructor() {
    FakeAudioContext.last = this;
  }

  private param() {
    return { value: 0, cancelScheduledValues() {}, setValueAtTime() {}, setTargetAtTime() {} };
  }

  private node(extra: object = {}) {
    return { connect: (n: unknown) => n, ...extra };
  }

  createDynamicsCompressor() {
    const p = () => this.param();
    return this.node({ threshold: p(), knee: p(), ratio: p(), attack: p(), release: p() });
  }

  createGain() {
    return this.node({ gain: this.param() });
  }

  resume() {
    return new Promise<void>(resolve => (this.resolveResume = resolve));
  }

  suspend() {
    this.suspended++;
    return Promise.resolve();
  }
}

describe('OffbeatAudioService', () => {
  const realContext = (window as any).AudioContext;
  let audio: OffbeatAudioService;

  beforeEach(() => {
    (window as any).AudioContext = FakeAudioContext;
    audio = new OffbeatAudioService();
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    (window as any).AudioContext = realContext;
  });

  it('turns on once the context has resumed', async () => {
    const pending = audio.enable();
    expect(audio.enabled).toBeFalse();
    FakeAudioContext.last.resolveResume();
    await pending;
    expect(audio.enabled).toBeTrue();
  });

  it('lets a disable win over an enable that is still resuming', async () => {
    const pending = audio.enable();
    await audio.disable();
    FakeAudioContext.last.resolveResume();
    await pending;
    expect(audio.enabled).toBeFalse();
  });

  it('suspends only after ringing voices have settled, unless re-enabled first', async () => {
    const on = audio.enable();
    FakeAudioContext.last.resolveResume();
    await on;

    await audio.disable();
    jasmine.clock().tick(1000);
    expect(FakeAudioContext.last.suspended).toBe(0);

    const again = audio.enable();
    FakeAudioContext.last.resolveResume();
    await again;
    jasmine.clock().tick(5000);
    expect(FakeAudioContext.last.suspended).toBe(0);

    await audio.disable();
    jasmine.clock().tick(5000);
    expect(FakeAudioContext.last.suspended).toBe(1);
  });
});
