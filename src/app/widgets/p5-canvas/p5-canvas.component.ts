import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Inject,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type p5 from 'p5';
import { Subscription } from 'rxjs';
import {
  OffbeatPalette,
  SketchAudio,
  SketchContext,
  SketchHooks,
  readPalette,
  seededRandom
} from '../../art/offbeat-sketch';
import { SKETCHES, SketchId } from '../../art/sketches';
import { OffbeatAudioService } from '../../art/audio/offbeat-audio.service';

/* Hosts one Offbeat p5 sketch in instance mode.
 * p5 is loaded on demand so it never weighs on the initial bundle, runs
 * outside Angular's zone so 60fps draws do not trigger change detection,
 * pauses while off screen, follows the site theme, and renders a single
 * still frame for visitors who prefer reduced motion unless the page lets
 * them opt back in.
 * Each host also owns an independent sound bus, audible only while sound
 * is on, the channel is unmuted and the sketch is on screen.
 */
@Component({
  selector: 'app-p5-canvas',
  template: '',
  styles: [`
    :host { display: block; position: relative; overflow: hidden; }
    :host ::ng-deep canvas { display: block; }
  `],
  host: { role: 'img' }
})
export class P5CanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) sketch!: SketchId;
  @Input() seed = 1;
  @Input() fps = 60;
  /** Whether clicks reach the sketch (the hero backdrop ignores them). */
  @Input() interactive = true;
  /** Silences this sketch's channel without touching the others. */
  @Input() muted = false;
  /** Animate even when the system asks for reduced motion (the visitor chose to). */
  @Input() forceMotion = false;

  private instance: p5 | null = null;
  private hooks: SketchHooks | null = null;
  private palette: OffbeatPalette | null = null;
  private visible = true;
  private viewReady = false;
  private destroyed = false;
  private generation = 0;
  private readonly pointer = { x: -1, y: -1, inside: false };
  private reducedMotion = false;
  /** True once p5 has loaded and the canvas exists. */
  ready = false;
  /** p5 runs setup after the constructor returns; until then the sketch has no size. */
  private started = false;

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private themeObserver?: MutationObserver;
  private colorScheme?: MediaQueryList;
  private motionQuery?: MediaQueryList;
  private bus: GainNode | null = null;
  private audioSub?: Subscription;

  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
    private audio: OffbeatAudioService,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.viewReady = true;
    this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.zone.runOutsideAngular(() => {
      this.observe();
      void this.mount();
    });
    this.audioSub = this.audio.enabled$.subscribe(() => this.applyGain());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) return;
    // forceMotion only matters while the system asks for reduced motion.
    const motionChanged = changes['forceMotion'] && this.motionQuery?.matches;
    if (changes['sketch'] || changes['seed'] || motionChanged) {
      this.zone.runOutsideAngular(() => void this.mount());
    }
    if (changes['muted']) this.applyGain();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.destroyed = true;
    this.unmount();
    this.audioSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.colorScheme?.removeEventListener('change', this.onThemeChange);
    this.motionQuery?.removeEventListener('change', this.onMotionChange);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.host.nativeElement.removeEventListener('pointerdown', this.onPointerDown);
    this.host.nativeElement.removeEventListener('pointerleave', this.onPointerLeave);
  }

  /** Download the current frame as a PNG. */
  save(name = `lazyrhythm-${this.sketch}-${this.seed}`): void {
    this.instance?.saveCanvas(name, 'png');
  }

  private async mount(): Promise<void> {
    const generation = ++this.generation;
    const { default: P5 } = await import('p5');
    if (this.destroyed || generation !== this.generation) return;

    this.unmount();
    this.reducedMotion = !this.forceMotion && (this.motionQuery?.matches ?? false);
    (P5 as unknown as { disableFriendlyErrors: boolean }).disableFriendlyErrors = true;

    const el = this.host.nativeElement;
    this.palette = readPalette(el);
    const factory = SKETCHES[this.sketch];
    const start = performance.now();

    const ctx: SketchContext = {
      seed: this.seed,
      reducedMotion: this.reducedMotion,
      pointer: this.pointer,
      palette: () => this.palette!,
      now: () => (this.reducedMotion ? 4200 : performance.now() - start),
      audio: this.createChannel(() => ctx.now())
    };

    this.instance = new P5((p: p5) => {
      this.hooks = factory(p, ctx);

      p.setup = () => {
        p.createCanvas(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight));
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.frameRate(this.fps);
        p.randomSeed(this.seed);
        p.noiseSeed(this.seed);
        this.hooks?.setup?.();
        if (this.reducedMotion || !this.visible) p.noLoop();
        this.started = true;
      };

      p.draw = () => this.hooks?.draw();
    }, el);
    this.setReady(true);
  }

  private unmount(): void {
    this.hooks?.dispose?.();
    this.instance?.remove();
    this.instance = null;
    this.hooks = null;
    this.started = false;
    this.bus?.disconnect();
    this.bus = null;
    this.setReady(false);
  }

  private get audible(): boolean {
    return this.audio.enabled && !this.muted && this.visible && !this.destroyed;
  }

  /** The sketch-facing view of this host's sound bus. The bus is built lazily on first use. */
  private createChannel(now: () => number): SketchAudio {
    const host = this;
    const rng = seededRandom(this.seed ^ 0x5eed);
    return {
      get active() {
        return host.audible && host.audio.ac !== null;
      },
      get ac() {
        return host.audio.ac!;
      },
      get out() {
        return host.ensureBus();
      },
      rng,
      at(ms: number) {
        const ac = host.audio.ac!;
        return ac.currentTime + Math.max(0, (ms - now()) / 1000);
      }
    };
  }

  private ensureBus(): GainNode {
    if (!this.bus) {
      const ac = this.audio.ac!;
      this.bus = ac.createGain();
      this.bus.gain.value = this.audible ? 1 : 0;
      this.bus.connect(this.audio.input!);
    }
    return this.bus;
  }

  // Short ramps so muting or scrolling away fades instead of clicking.
  private applyGain(): void {
    const ac = this.audio.ac;
    if (!this.bus || !ac) return;
    this.bus.gain.setTargetAtTime(this.audible ? 1 : 0, ac.currentTime, 0.06);
  }

  // p5 runs outside the zone; re-enter it so bindings like [disabled] update.
  private setReady(ready: boolean): void {
    if (this.ready !== ready) this.zone.run(() => (this.ready = ready));
  }

  private observe(): void {
    const el = this.host.nativeElement;

    this.resizeObserver = new ResizeObserver(() => {
      const p = this.instance;
      if (!p || !this.started || !el.clientWidth || !el.clientHeight) return;
      if (p.width === el.clientWidth && p.height === el.clientHeight) return;
      p.resizeCanvas(el.clientWidth, el.clientHeight);
      this.hooks?.resize?.();
      if (this.reducedMotion || !this.visible) p.redraw();
    });
    this.resizeObserver.observe(el);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.applyGain();
      if (!this.instance || this.reducedMotion) return;
      if (this.visible) this.instance.loop();
      else this.instance.noLoop();
    });
    this.intersectionObserver.observe(el);

    this.themeObserver = new MutationObserver(this.onThemeChange);
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      subtree: true
    });
    this.colorScheme = matchMedia('(prefers-color-scheme: light)');
    this.colorScheme.addEventListener('change', this.onThemeChange);
    this.motionQuery?.addEventListener('change', this.onMotionChange);

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    el.addEventListener('pointerleave', this.onPointerLeave);
    el.addEventListener('pointerdown', this.onPointerDown);
  }

  // Remount so the sketch switches between animating and a single still frame.
  private onMotionChange = (): void => {
    void this.mount();
  };

  private onThemeChange = (): void => {
    this.palette = readPalette(this.host.nativeElement);
    this.hooks?.themeChanged?.();
    if (this.reducedMotion || !this.visible) this.instance?.redraw();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
    this.pointer.inside = this.pointer.x >= 0 && this.pointer.y >= 0 &&
      this.pointer.x <= rect.width && this.pointer.y <= rect.height;
  };

  private onPointerLeave = (): void => {
    this.pointer.inside = false;
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.interactive || !this.hooks?.press) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.hooks.press(event.clientX - rect.left, event.clientY - rect.top);
    if (this.reducedMotion) this.instance?.redraw();
  };
}
