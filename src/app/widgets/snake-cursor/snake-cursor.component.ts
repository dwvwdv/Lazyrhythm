import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrailPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-snake-cursor',
  imports: [CommonModule],
  templateUrl: './snake-cursor.component.html',
  styleUrls: ['./snake-cursor.component.scss']
})
export class SnakeCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('snakeCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private enabled = true;
  private dpr = 1;

  private pointer: TrailPoint = { x: -100, y: -100 };
  private trail: TrailPoint[] = Array.from({ length: 5 }, () => ({ x: -100, y: -100 }));

  ngAfterViewInit(): void {
    this.enabled = window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.enabled) {
      this.canvasRef.nativeElement.hidden = true;
      return;
    }

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.enabled) return;
    this.pointer = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.pointer = { x: -100, y: -100 };
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.enabled) this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * this.dpr);
    canvas.height = Math.floor(window.innerHeight * this.dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private animate = (): void => {
    this.updateTrail();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updateTrail(): void {
    let target = this.pointer;

    this.trail.forEach((point, index) => {
      const easing = 0.28 - index * 0.025;
      point.x += (target.x - point.x) * easing;
      point.y += (target.y - point.y) * easing;
      target = point;
    });
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr);

    const styles = getComputedStyle(document.documentElement);
    const frost1 = styles.getPropertyValue('--frost1').trim() || '#88C0D0';
    const frost3 = styles.getPropertyValue('--frost3').trim() || '#5E81AC';
    const polar0 = styles.getPropertyValue('--polar0').trim() || '#2E3440';

    this.trail
      .slice()
      .reverse()
      .forEach((point, reverseIndex) => {
        const index = this.trail.length - 1 - reverseIndex;
        const size = 4 + (this.trail.length - index) * 1.5;
        const opacity = 0.12 + (this.trail.length - index) * 0.08;

        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = index === 0 ? frost1 : frost3;
        this.ctx.fillRect(
          Math.round(point.x - size / 2) + index * 1.5,
          Math.round(point.y - size / 2) + index * 1.5,
          size,
          size
        );
      });

    this.ctx.globalAlpha = 1;

    const head = this.trail[0];
    const size = 10;
    this.ctx.fillStyle = polar0;
    this.ctx.fillRect(Math.round(head.x - size / 2), Math.round(head.y - size / 2), size, size);
    this.ctx.strokeStyle = frost1;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(Math.round(head.x - size / 2), Math.round(head.y - size / 2), size, size);
  }
}
