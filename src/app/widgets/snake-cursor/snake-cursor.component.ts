import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

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

    // Draw snake segments as rounded squares
    this.snakeSegments.forEach((segment, index) => {
      // Convert grid position to pixel position
      const pixelX = segment.x * this.gridSize + this.gridSize / 2;
      const pixelY = segment.y * this.gridSize + this.gridSize / 2;

      // Gradient from head to tail (green to blue)
      const hue = 120 + (index / this.snakeSegments.length) * 60; // 120 (green) to 180 (cyan)
      const lightness = 50 - (index / this.snakeSegments.length) * 10; // Slightly darker towards tail
      this.ctx.fillStyle = `hsla(${hue}, 70%, ${lightness}%, 0.9)`;

      // Draw rounded square
      this.drawRoundedSquare(pixelX, pixelY, this.gridSize - 2, this.borderRadius);

      // Draw eyes on the head
      if (index === 0) {
        const eyeSize = 2.5;
        const eyeOffset = 4;

        // Determine eye position based on direction
        let eyeY = pixelY - eyeOffset;

        // White of eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupils
        this.ctx.fillStyle = 'black';
        const pupilSize = 1.2;
        this.ctx.beginPath();
        this.ctx.arc(pixelX - eyeOffset, eyeY, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(pixelX + eyeOffset, eyeY, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw grid position indicator at mouse cursor (semi-transparent)
    const mouseGridX = Math.floor(this.mousePosition.x / this.gridSize);
    const mouseGridY = Math.floor(this.mousePosition.y / this.gridSize);
    const indicatorX = mouseGridX * this.gridSize + this.gridSize / 2;
    const indicatorY = mouseGridY * this.gridSize + this.gridSize / 2;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.drawRoundedSquare(indicatorX, indicatorY, this.gridSize - 2, this.borderRadius);
  }
}
