import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';
import { I18nService } from '../../i18n/i18n.service';
import { Lang } from '../../i18n/translations';
import { TranslatePipe } from '../../i18n/translate.pipe';

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
}

@Component({
  selector: 'app-works',
  imports: [CommonModule, TranslatePipe],
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
    private i18n: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.rows = await this.websiteData.getProjects();
      // 切換語系時直接換成對應的翻譯，不需重新抓資料。
      this.sub = this.i18n.lang$.subscribe(lang => (this.projects = this.rows.map(row => localizeProject(row, lang))));
    } catch (error) {
      console.error('Unable to load projects from Supabase', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get filteredProjects(): Project[] {
    if (this.selectedCategory === 'all') {
      return this.projects;
    }

    return this.projects.filter(project => project.category === this.selectedCategory);
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
    featured: row.featured
  };
}
