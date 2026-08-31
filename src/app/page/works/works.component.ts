import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteDataService } from '../../services/website-data.service';

interface Project {
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
  imports: [CommonModule],
  templateUrl: './works.component.html',
  styleUrls: ['./works.component.scss']
})
export class WorksComponent implements OnInit {
  selectedCategory = 'all';
  projects: Project[] = [];
  isLoading = true;
  loadError = false;

  categories = [
    { id: 'all', name: 'All Projects', icon: 'fas fa-th-large' },
    { id: 'reading', name: 'Reading & Knowledge', icon: 'fas fa-book-open' },
    { id: 'finance', name: 'Financial Tech', icon: 'fas fa-chart-line' },
    { id: 'gaming', name: 'Games', icon: 'fas fa-gamepad' },
    { id: 'security', name: 'Security Tools', icon: 'fas fa-shield-alt' },
    { id: 'automation', name: 'Automation', icon: 'fas fa-robot' },
    { id: 'other', name: 'Other', icon: 'fas fa-code' }
  ];

  constructor(private websiteData: WebsiteDataService) {}

  async ngOnInit(): Promise<void> {
    try {
      const rows = await this.websiteData.getProjects();
      this.projects = rows.map(row => ({
        id: row.slug,
        image: row.image_url ?? '',
        imageFit: row.image_fit,
        title: row.title,
        description: row.description,
        tags: row.tags,
        category: row.category,
        link: row.project_url,
        technologies: row.technologies,
        featured: row.featured
      }));
    } catch (error) {
      console.error('Unable to load projects from Supabase', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
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
