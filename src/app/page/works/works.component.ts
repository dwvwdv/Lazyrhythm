import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';
import { I18nService } from '../../i18n/i18n.service';
import { Lang } from '../../i18n/translations';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { LocalizePipe } from '../../i18n/localize.pipe';
import { PROJECTS_STATE, PrerenderedContent } from '../../services/public-content';
import { hasProductPage, productPath } from '../../products/product-index';

export interface Project {
  id: string;
  image: string;
  imageFit: 'contain' | 'cover';
  title: string;
  description: string;
  tags: string[];
  category: 'finance' | 'gaming' | 'security' | 'automation' | 'reading' | 'other';
  link: string;
  technologies: string[];
  featured?: boolean;
  /** This site's product page, when the project has one; `link` stays the external site. */
  page: string | null;
}

@Component({
  selector: 'app-works',
  imports: [CommonModule, RouterModule, TranslatePipe, LocalizePipe],
  templateUrl: './works.component.html',
  styleUrls: ['./works.component.scss']
})
export class WorksComponent implements OnInit, OnDestroy {
  selectedCategory = 'all';
  projects: Project[] = [];
  isLoading = true;
  loadError = false;
  private rows: WebsiteProjectRow[] = [];
  private sub?: Subscription;

  categories = [
    { id: 'all', name: 'works.cat.all', icon: 'fas fa-th-large' },
    { id: 'reading', name: 'works.cat.reading', icon: 'fas fa-book-open' },
    { id: 'finance', name: 'works.cat.finance', icon: 'fas fa-chart-line' },
    { id: 'gaming', name: 'works.cat.gaming', icon: 'fas fa-gamepad' },
    { id: 'security', name: 'works.cat.security', icon: 'fas fa-shield-alt' },
    { id: 'automation', name: 'works.cat.automation', icon: 'fas fa-robot' },
    { id: 'other', name: 'works.cat.other', icon: 'fas fa-code' }
  ];

  constructor(
    private websiteData: WebsiteDataService,
    private i18n: I18nService,
    private prerendered: PrerenderedContent,
    private router: Router,
    private viewport: ViewportScroller,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {}

  async ngOnInit(): Promise<void> {
    // The prerendered page already lists the projects the build read; the browser starts from
    // the same rows so hydration matches, then refreshes them from the live data.
    const prerendered = this.prerendered.take(PROJECTS_STATE, content => content.projects);
    if (prerendered) {
      this.rows = prerendered;
      this.localize();
      this.isLoading = false;
    }
    if (!isPlatformBrowser(this.platformId)) return;
    // 切換語系時直接換成對應的翻譯，不需重新抓資料；先訂閱再 await，避免元件銷毀後才建立訂閱。
    this.sub = this.i18n.lang$.subscribe(() => this.localize());

    try {
      this.rows = await this.websiteData.getProjects();
      this.localize();
      // A link to /works#<slug> from another page arrives before the cards exist.
      const fragment = this.router.parseUrl(this.router.url).fragment;
      if (!prerendered && fragment) setTimeout(() => this.viewport.scrollToAnchor(fragment));
    } catch (error) {
      console.error('Unable to load projects from Supabase', error);
      // Keep showing the prerendered projects when the refresh fails.
      this.loadError = !prerendered;
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private localize(): void {
    this.projects = this.rows.map(row => localizeProject(row, this.i18n.lang));
  }

  get filteredProjects(): Project[] {
    if (this.selectedCategory === 'all') {
      return this.projects;
    }

    return this.projects.filter(project => project.category === this.selectedCategory);
  }

  trackProject(_: number, project: Project): string {
    return project.id;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }
}

export function localizeProject(row: WebsiteProjectRow, lang: Lang): Project {
  const translation = row.translations?.[lang] ?? {};
  return {
    id: row.slug,
    image: row.image_url ?? '',
    imageFit: row.image_fit,
    title: translation.title || row.title,
    description: translation.description || row.description,
    tags: translation.tags?.length ? translation.tags : row.tags,
    category: row.category,
    link: row.project_url,
    technologies: row.technologies,
    featured: row.featured,
    page: hasProductPage(row.slug) ? productPath(row.slug) : null
  };
}
