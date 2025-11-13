import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

interface Point {
  x: number;
  y: number;
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
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
  private themeSubscription?: Subscription;
  private isDarkMode = false;

  // Configuration parameters
  private readonly gridSize = 20; // Size of each grid cell (square)
  private readonly moveSpeed = 150; // Milliseconds between moves (lower = faster)
  private readonly initialSegments = 5;
  private readonly maxLength = 30; // Maximum snake length
  private readonly borderRadius = 4; // Rounded corner radius

  // Mouse tracking
  private mousePosition: Point = { x: 0, y: 0 };
  private lastMousePosition: Point = { x: 0, y: 0 };
  private mouseHasMoved = false;

  // Snake state
  private snakeSegments: Point[] = []; // Grid positions
  private currentDirection: Direction = Direction.RIGHT;
  private lastMoveTime = 0;
  private targetGridPosition: Point | null = null;

  constructor(private themeService: ThemeService) {}

  ngAfterViewInit(): void {
    this.initCanvas();
    this.initSnake();
    this.startAnimation();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.darkMode$.subscribe(
      isDark => {
        this.isDarkMode = isDark;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const newX = event.clientX;
    const newY = event.clientY;

    // Check if mouse has actually moved
    if (newX !== this.lastMousePosition.x || newY !== this.lastMousePosition.y) {
      this.mouseHasMoved = true;
      this.lastMousePosition = { x: newX, y: newY };
    }

    this.mousePosition.x = newX;
    this.mousePosition.y = newY;
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
    const centerGridX = Math.floor(window.innerWidth / 2 / this.gridSize);
    const centerGridY = Math.floor(window.innerHeight / 2 / this.gridSize);

    // Initialize snake segments in grid coordinates
    for (let i = 0; i < this.initialSegments; i++) {
      this.snakeSegments.push({
        x: centerGridX - i,
        y: centerGridY
      });
    }

    // Initialize mouse position
    this.mousePosition.x = window.innerWidth / 2;
    this.mousePosition.y = window.innerHeight / 2;
    this.lastMousePosition = { ...this.mousePosition };
  }

  private startAnimation(): void {
    const animate = (timestamp: number) => {
      if (!this.lastMoveTime) this.lastMoveTime = timestamp;

      const elapsed = timestamp - this.lastMoveTime;

      if (elapsed >= this.moveSpeed) {
        this.update();
        this.lastMoveTime = timestamp;
      }

      this.draw();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private update(): void {
    if (this.snakeSegments.length === 0) return;

    const head = this.snakeSegments[0];
    const mouseGridX = Math.floor(this.mousePosition.x / this.gridSize);
    const mouseGridY = Math.floor(this.mousePosition.y / this.gridSize);

    // Determine direction to move towards mouse
    const dx = mouseGridX - head.x;
    const dy = mouseGridY - head.y;

    // Only change direction if we're not already at the target
    if (dx !== 0 || dy !== 0) {
      // Choose primary direction based on largest difference
      if (Math.abs(dx) > Math.abs(dy)) {
        this.currentDirection = dx > 0 ? Direction.RIGHT : Direction.LEFT;
      } else if (Math.abs(dy) > 0) {
        this.currentDirection = dy > 0 ? Direction.DOWN : Direction.UP;
      }
    }

    // Calculate new head position
    let newHead = { ...head };
    switch (this.currentDirection) {
      case Direction.UP:
        newHead.y -= 1;
        break;
      case Direction.DOWN:
        newHead.y += 1;
        break;
      case Direction.LEFT:
        newHead.x -= 1;
        break;
      case Direction.RIGHT:
        newHead.x += 1;
        break;
    }

    // Check if reached cursor position
    const reachedCursor = newHead.x === mouseGridX && newHead.y === mouseGridY;

    // Add new head
    this.snakeSegments.unshift(newHead);

    // Grow if reached cursor and mouse has moved, and not at max length
    if (reachedCursor && this.mouseHasMoved && this.snakeSegments.length < this.maxLength) {
      this.mouseHasMoved = false; // Reset flag
    } else {
      // Remove tail (no growth)
      this.snakeSegments.pop();
    }

    // Keep snake within bounds
    const maxGridX = Math.floor(window.innerWidth / this.gridSize);
    const maxGridY = Math.floor(window.innerHeight / this.gridSize);

    if (newHead.x < 0) newHead.x = 0;
    if (newHead.x >= maxGridX) newHead.x = maxGridX - 1;
    if (newHead.y < 0) newHead.y = 0;
    if (newHead.y >= maxGridY) newHead.y = maxGridY - 1;
  }

  private drawRoundedSquare(x: number, y: number, size: number, radius: number): void {
    const halfSize = size / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(x - halfSize + radius, y - halfSize);
    this.ctx.lineTo(x + halfSize - radius, y - halfSize);
    this.ctx.quadraticCurveTo(x + halfSize, y - halfSize, x + halfSize, y - halfSize + radius);
    this.ctx.lineTo(x + halfSize, y + halfSize - radius);
    this.ctx.quadraticCurveTo(x + halfSize, y + halfSize, x + halfSize - radius, y + halfSize);
    this.ctx.lineTo(x - halfSize + radius, y + halfSize);
    this.ctx.quadraticCurveTo(x - halfSize, y + halfSize, x - halfSize, y + halfSize - radius);
    this.ctx.lineTo(x - halfSize, y - halfSize + radius);
    this.ctx.quadraticCurveTo(x - halfSize, y - halfSize, x - halfSize + radius, y - halfSize);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private draw(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    // Neumorphism color scheme based on theme
    const colorScheme = this.isDarkMode ? {
      // Dark theme: vibrant blue gradient
      baseHue: 210,        // Blue
      hueRange: 30,        // To light blue/cyan
      baseSaturation: 85,
      baseLightness: 65,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      highlightColor: 'rgba(255, 255, 255, 0.1)',
      eyeWhite: '#e2e8f0',
      pupilColor: '#1a1d28'
    } : {
      // Light theme: softer blue gradient matching neumorphism palette
      baseHue: 205,        // Blue
      hueRange: 25,        // To cyan-blue
      baseSaturation: 60,
      baseLightness: 55,
      shadowColor: 'rgba(163, 177, 198, 0.5)',
      highlightColor: 'rgba(255, 255, 255, 0.8)',
      eyeWhite: '#ffffff',
      pupilColor: '#2d3748'
    };

    // Draw snake segments with neumorphism effect
    this.snakeSegments.forEach((segment, index) => {
      // Convert grid position to pixel position
      const pixelX = segment.x * this.gridSize + this.gridSize / 2;
      const pixelY = segment.y * this.gridSize + this.gridSize / 2;

      // Calculate color gradient from head to tail
      const progress = index / Math.max(this.snakeSegments.length - 1, 1);
      const hue = colorScheme.baseHue + progress * colorScheme.hueRange;
      const saturation = colorScheme.baseSaturation - progress * 15;
      const lightness = colorScheme.baseLightness - progress * 10;
      const alpha = 0.95 - progress * 0.2;

      // Draw shadow for neumorphism effect (bottom-right)
      this.ctx.fillStyle = colorScheme.shadowColor;
      this.drawRoundedSquare(pixelX + 1.5, pixelY + 1.5, this.gridSize - 2, this.borderRadius);

      // Draw highlight (top-left)
      this.ctx.fillStyle = colorScheme.highlightColor;
      this.drawRoundedSquare(pixelX - 1, pixelY - 1, this.gridSize - 2, this.borderRadius);

      // Draw main segment
      this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      this.drawRoundedSquare(pixelX, pixelY, this.gridSize - 2, this.borderRadius);

      // Draw inner glow for more neumorphism depth
      if (index < 3) {
        const glowSize = this.gridSize - 6;
        this.ctx.fillStyle = `hsla(${hue}, ${saturation + 10}%, ${lightness + 15}%, 0.4)`;
        this.drawRoundedSquare(pixelX, pixelY, glowSize, this.borderRadius - 1);
      }

      // Draw eyes on the head
      if (index === 0) {
        const eyeSize = 2.5;
        const eyeOffset = 4;
        const eyeY = pixelY - eyeOffset;

        // Eye background (neumorphic inset)
        this.ctx.fillStyle = colorScheme.shadowColor;
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset, eyeY, eyeSize + 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset, eyeY, eyeSize + 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // White of eyes
        this.ctx.fillStyle = colorScheme.eyeWhite;
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils with slight gradient
        const pupilSize = 1.2;
        this.ctx.fillStyle = colorScheme.pupilColor;
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset, eyeY, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset, eyeY, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye highlights
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const highlightSize = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset + 0.5, eyeY - 0.5, highlightSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset + 0.5, eyeY - 0.5, highlightSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
}
