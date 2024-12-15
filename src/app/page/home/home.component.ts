import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  dominoItems = [
    { icon: 'fas fa-gamepad', text: '遊戲開發' },
    { icon: 'fas fa-code', text: '程式設計' },
    { icon: 'fas fa-paint-brush', text: '美術設計' },
    { icon: 'fas fa-music', text: '音樂製作' }
  ];

  cardItems = [
    {
      icon: 'fas fa-rocket',
      title: '創新遊戲體驗',
      description: '打造獨特的遊戲玩法，帶給玩家全新的體驗'
    },
    {
      icon: 'fas fa-heart',
      title: '精心製作',
      description: '每個細節都經過精心打磨，確保最佳品質'
    },
    {
      icon: 'fas fa-users',
      title: '社群互動',
      description: '重視玩家回饋，持續優化遊戲體驗'
    },
    {
      icon: 'fas fa-star',
      title: '獨特風格',
      description: '建立專屬的遊戲風格，打造難忘的遊戲世界'
    }
  ];

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit() {
    this.initTypewriter();
  }

  ngAfterViewInit() {
    this.initDominoEffect();
    this.initFloatingCards();
  }

  private initTypewriter() {
    const text = "歡迎來到 LazyRhythm";
    const element = document.querySelector('.typewriter-text');
    if (!element) return;

    let i = 0;
    const speed = 100;

    function typeWriter() {
      if (i < text.length) {
        element!.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }

    typeWriter();
  }

  private initDominoEffect() {
    const dominos = gsap.utils.toArray('.domino');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.domino-section',
        start: 'top center',
        toggleActions: 'play none none reverse'
      }
    });

    dominos.forEach((domino: any, i) => {
      tl.from(domino, {
        rotateX: -90,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        delay: i * 0.1
      }, i * 0.1);
    });
  }

  private initFloatingCards() {
    const cards = gsap.utils.toArray('.floating-card');

    cards.forEach((card: any, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: i * 0.2,
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        }
      });

      gsap.to(card, {
        y: 'random(-10, 10)',
        rotation: 'random(-3, 3)',
        duration: 'random(2, 3)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.1
      });
    });
  }
}
