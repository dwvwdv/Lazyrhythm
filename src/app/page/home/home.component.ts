import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { P5CanvasComponent } from '../../widgets/p5-canvas/p5-canvas.component';

@Component({
    selector: 'app-home',
    imports: [CommonModule, TranslatePipe, P5CanvasComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Generative backdrop for the hero; a new composition on every visit.
  heroSeed = Math.floor(Math.random() * 0xffffff);

  // Main feature areas of the experimental lab
  labAreas = [
    {
      icon: 'fas fa-chart-line',
      title: 'home.area.finance.title',
      description: 'home.area.finance.desc'
    },
    {
      icon: 'fas fa-gamepad',
      title: 'home.area.gaming.title',
      description: 'home.area.gaming.desc'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'home.area.security.title',
      description: 'home.area.security.desc'
    },
    {
      icon: 'fas fa-robot',
      title: 'home.area.automation.title',
      description: 'home.area.automation.desc'
    }
  ];

  private animations?: gsap.Context;
  private refreshFrame = 0;

  constructor(private host: ElementRef<HTMLElement>) {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit() {
    // Initialization
  }

  ngAfterViewInit() {
    // Scope every tween and ScrollTrigger to this page so they can all be reverted on leave.
    this.animations = gsap.context(() => this.initRhythmicAnimations(), this.host.nativeElement);
    // When arriving from another route, the previous page is still in the DOM while this runs,
    // so trigger positions are measured against the wrong layout. Re-measure once it is gone.
    this.refreshFrame = requestAnimationFrame(() => {
      this.refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.refreshFrame);
    this.animations?.revert();
  }

  // LazyRhythm themed animations - slow, rhythmic, wave-based
  private initRhythmicAnimations() {
    // Rhythmic pulse animation for lab area cards
    const cards = gsap.utils.toArray<HTMLElement>('.lab-card');

    cards.forEach((card, i) => {
      // Slow fade-in on scroll
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        }
      });

      // Continuous rhythmic pulse - subtle scale animation
      gsap.to(card, {
        scale: 1.02,
        duration: 2 + (i * 0.3), // Staggered rhythm
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.4
      });
    });

    // Wave animation for hero section
    const heroTitle = this.host.nativeElement.querySelector('.hero-title');
    if (heroTitle) {
      // Gentle wave motion
      gsap.to(heroTitle, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }
}
