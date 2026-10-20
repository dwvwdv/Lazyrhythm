import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { P5CanvasComponent } from '../../widgets/p5-canvas/p5-canvas.component';
import { LocalizePipe } from '../../i18n/localize.pipe';
import { I18nService } from '../../i18n/i18n.service';
import { Project, localizeProject } from '../works/works.component';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';
import { PROJECTS_STATE, PrerenderedContent } from '../../services/public-content';

@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterModule, TranslatePipe, LocalizePipe, P5CanvasComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Generative backdrop for the hero; a new composition on every visit.
  heroSeed = Math.floor(Math.random() * 0xffffff);

  // Main feature areas of the experimental lab
  labAreas = [
    {
      icon: 'fas fa-book-open',
      title: 'home.area.reading.title',
      description: 'home.area.reading.desc'
    },
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

  /** Featured projects, so the brand page names what LazyRhythm makes. */
  products: Project[] = [];

  private rows: WebsiteProjectRow[] = [];
  private sub?: Subscription;
  private animations?: gsap.Context;
  private refreshFrame = 0;

  constructor(
    private host: ElementRef<HTMLElement>,
    private i18n: I18nService,
    private websiteData: WebsiteDataService,
    private prerendered: PrerenderedContent,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {
    if (isPlatformBrowser(this.platformId)) gsap.registerPlugin(ScrollTrigger);
  }

  async ngOnInit() {
    // Same rows as the prerendered page during hydration, then the live ones.
    const prerendered = this.prerendered.take(PROJECTS_STATE, content => content.projects);
    if (prerendered) this.showProducts(prerendered);
    if (!isPlatformBrowser(this.platformId)) return;
    this.sub = this.i18n.lang$.subscribe(() => this.showProducts(this.rows));
    try {
      this.showProducts(await this.websiteData.getProjects());
    } catch (error) {
      // Keeps the prerendered projects, if any; the projects page reports the error.
      console.error('Unable to load projects from Supabase', error);
    }
  }

  trackProduct(_: number, product: Project): string {
    return product.id;
  }

  private showProducts(rows: WebsiteProjectRow[]): void {
    this.rows = rows;
    this.products = rows.filter(row => row.featured).map(row => localizeProject(row, this.i18n.lang));
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Scope every tween and ScrollTrigger to this page so they can all be reverted on leave.
    this.animations = gsap.context(() => this.initRhythmicAnimations(), this.host.nativeElement);
    // When arriving from another route, the previous page is still in the DOM while this runs,
    // so trigger positions are measured against the wrong layout. Re-measure once it is gone.
    this.refreshFrame = requestAnimationFrame(() => {
      this.refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) cancelAnimationFrame(this.refreshFrame);
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
