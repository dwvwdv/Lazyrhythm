import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
    selector: 'app-home',
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  // Main feature areas of the experimental lab
  labAreas = [
    {
      icon: 'fas fa-chart-line',
      title: 'Financial Tech',
      description: 'Trading bots, market analysis, and fintech applications'
    },
    {
      icon: 'fas fa-gamepad',
      title: 'Game Development',
      description: 'Interactive experiences and experimental game mechanics'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Security Tools',
      description: 'Cybersecurity utilities and penetration testing tools'
    },
    {
      icon: 'fas fa-robot',
      title: 'Automation',
      description: 'Workflow automation and productivity tools'
    }
  ];

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit() {
    // Initialization
  }

  ngAfterViewInit() {
    this.initRhythmicAnimations();
  }

  // LazyRhythm themed animations - slow, rhythmic, wave-based
  private initRhythmicAnimations() {
    // Rhythmic pulse animation for lab area cards
    const cards = gsap.utils.toArray('.lab-card');

    cards.forEach((card: any, i) => {
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
    const heroTitle = document.querySelector('.hero-title');
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
