import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
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
  private animationFrameId: number = 0;
  private mousePosition: Point = { x: 0, y: 0 };
  private snakeSegments: Point[] = [];
  private segmentSize = 10;
  private segmentSpacing = 5;
  private initialSegments = 5;
  private targetPosition: Point = { x: 0, y: 0 };
  private smoothness = 0.15;
  private collisionDistance = 20;
  private lastCollisionTime = 0;
  private collisionCooldown = 1000; // 1 second cooldown

  ngAfterViewInit(): void {
    this.initCanvas();
    this.initSnake();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initSnake(): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    this.targetPosition = { x: centerX, y: centerY };

    for (let i = 0; i < this.initialSegments; i++) {
      this.snakeSegments.push({
        x: centerX - i * (this.segmentSize + this.segmentSpacing),
        y: centerY
      });
    }
  }

  private startAnimation(): void {
    const animate = () => {
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private update(): void {
    // Smoothly move the head towards the mouse position
    this.targetPosition.x += (this.mousePosition.x - this.targetPosition.x) * this.smoothness;
    this.targetPosition.y += (this.mousePosition.y - this.targetPosition.y) * this.smoothness;

    // Check for collision between snake head and cursor
    this.checkCollision();

    // Update snake segments
    if (this.snakeSegments.length > 0) {
      // Move head
      this.snakeSegments[0] = { ...this.targetPosition };

      // Move body segments to follow
      for (let i = 1; i < this.snakeSegments.length; i++) {
        const prev = this.snakeSegments[i - 1];
        const current = this.snakeSegments[i];

        const dx = prev.x - current.x;
        const dy = prev.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.segmentSize + this.segmentSpacing) {
          const angle = Math.atan2(dy, dx);
          current.x = prev.x - Math.cos(angle) * (this.segmentSize + this.segmentSpacing);
          current.y = prev.y - Math.sin(angle) * (this.segmentSize + this.segmentSpacing);
        }
      }
    }
  }

  private checkCollision(): void {
    if (this.snakeSegments.length === 0) return;

    const head = this.snakeSegments[0];
    const dx = this.mousePosition.x - head.x;
    const dy = this.mousePosition.y - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const currentTime = Date.now();

    // If snake head is close to the cursor and cooldown has passed
    if (distance < this.collisionDistance &&
        currentTime - this.lastCollisionTime > this.collisionCooldown) {
      this.growSnake();
      this.lastCollisionTime = currentTime;
    }
  }

  private growSnake(): void {
    if (this.snakeSegments.length > 0) {
      const lastSegment = this.snakeSegments[this.snakeSegments.length - 1];
      const secondLast = this.snakeSegments.length > 1
        ? this.snakeSegments[this.snakeSegments.length - 2]
        : lastSegment;

      const dx = lastSegment.x - secondLast.x;
      const dy = lastSegment.y - secondLast.y;
      const angle = Math.atan2(dy, dx);

      this.snakeSegments.push({
        x: lastSegment.x + Math.cos(angle) * (this.segmentSize + this.segmentSpacing),
        y: lastSegment.y + Math.sin(angle) * (this.segmentSize + this.segmentSpacing)
      });
    }
  }

  private draw(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    // Draw snake
    this.snakeSegments.forEach((segment, index) => {
      // Gradient from head to tail
      const hue = (120 + index * 5) % 360; // Green to blue gradient
      this.ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;

      this.ctx.beginPath();
      this.ctx.arc(segment.x, segment.y, this.segmentSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw eyes on the head
      if (index === 0) {
        this.ctx.fillStyle = 'white';
        const eyeSize = 3;
        const eyeOffset = 4;

        this.ctx.beginPath();
        this.ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = 'black';
        const pupilSize = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(segment.x - eyeOffset, segment.y - eyeOffset, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(segment.x + eyeOffset, segment.y - eyeOffset, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw cursor indicator (for debugging collision detection)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, this.collisionDistance, 0, Math.PI * 2);
    this.ctx.stroke();
  }
}
