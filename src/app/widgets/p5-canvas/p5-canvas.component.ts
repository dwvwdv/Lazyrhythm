import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import type p5 from 'p5';
import { OffbeatPalette, SketchContext, SketchHooks, readPalette } from '../../art/offbeat-sketch';
import { SKETCHES, SketchId } from '../../art/sketches';

/* Hosts one Offbeat p5 sketch in instance mode.
 * p5 is loaded on demand so it never weighs on the initial bundle, runs
 * outside Angular's zone so 60fps draws do not trigger change detection,
 * pauses while off screen, follows the site theme, and renders a single
 * still frame for visitors who prefer reduced motion.
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

  private instance: p5 | null = null;
  private hooks: SketchHooks | null = null;
  private palette: OffbeatPalette | null = null;
  private visible = true;
  private viewReady = false;
  private destroyed = false;
  private generation = 0;
  private readonly pointer = { x: -1, y: -1, inside: false };
  private readonly reducedMotion = typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private themeObserver?: MutationObserver;
  private colorScheme?: MediaQueryList;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.zone.runOutsideAngular(() => {
      this.observe();
      void this.mount();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) return;
    if (changes['sketch'] || changes['seed']) {
      this.zone.runOutsideAngular(() => void this.mount());
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.unmount();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.colorScheme?.removeEventListener('change', this.onThemeChange);
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
      now: () => (this.reducedMotion ? 4200 : performance.now() - start)
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
      };

      p.draw = () => this.hooks?.draw();
    }, el);
  }

  private unmount(): void {
    this.instance?.remove();
    this.instance = null;
    this.hooks = null;
  }

  private observe(): void {
    const el = this.host.nativeElement;

    this.resizeObserver = new ResizeObserver(() => {
      const p = this.instance;
      if (!p || !el.clientWidth || !el.clientHeight) return;
      if (p.width === el.clientWidth && p.height === el.clientHeight) return;
      p.resizeCanvas(el.clientWidth, el.clientHeight);
      this.hooks?.resize?.();
      if (this.reducedMotion || !this.visible) p.redraw();
    });
    this.resizeObserver.observe(el);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
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

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    el.addEventListener('pointerleave', this.onPointerLeave);
    el.addEventListener('pointerdown', this.onPointerDown);
  }

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
