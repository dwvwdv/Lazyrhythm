import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselItem {
  image: string;
  title: string;
  description: string;
}

@Component({
    selector: 'app-carousel',
    imports: [CommonModule],
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
  @Input() items: CarouselItem[] = [];
  currentIndex = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  prev() {
    this.currentIndex = this.currentIndex === 0 
      ? this.items.length - 1 
      : this.currentIndex - 1;
  }
} 