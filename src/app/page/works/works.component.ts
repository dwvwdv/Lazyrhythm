import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  id: string;
  image: string;
  title: string;
  description: string;
  tags: string[];
  category: 'finance' | 'gaming' | 'security' | 'automation' | 'other';
  link: string;
  technologies: string[];
}

@Component({
    selector: 'app-works',
    imports: [CommonModule],
    templateUrl: './works.component.html',
    styleUrls: ['./works.component.scss']
})
export class WorksComponent {
  selectedCategory: string = 'all';

  categories = [
    { id: 'all', name: 'All Projects', icon: 'fas fa-th' },
    { id: 'finance', name: 'Financial Tech', icon: 'fas fa-chart-line' },
    { id: 'gaming', name: 'Games', icon: 'fas fa-gamepad' },
    { id: 'security', name: 'Security Tools', icon: 'fas fa-shield-alt' },
    { id: 'automation', name: 'Automation', icon: 'fas fa-robot' },
    { id: 'other', name: 'Other', icon: 'fas fa-code' }
  ];

  projects: Project[] = [
    // Security Tools
    {
      id: 'hitcon-crawl',
      image: '',
      title: 'HITCON-Vuls-Crawler',
      description: 'Fast terminal-based TUI tool for browsing HITCON vulnerability disclosures. Efficient command-line interface for security researchers to quickly access and review publicly disclosed vulnerabilities.',
      tags: ['Python', 'TUI', 'Security Research'],
      category: 'security',
      link: 'https://github.com/dwvwdv/HITCON-Vuls-Crawler',
      technologies: ['Python', 'Terminal UI', 'Web Scraping']
    },

    // Financial Tech Projects
    {
      id: 'sure-finance',
      image: 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/Surefiance/icon.png',
      title: 'Sure Finance',
      description: 'Financial management and analysis platform designed for tracking investments, analyzing market trends, and managing personal finance portfolios.',
      tags: ['Finance', 'Analytics', 'Data Visualization'],
      category: 'finance',
      link: '#',
      technologies: ['TypeScript', 'Angular', 'Chart.js']
    },

    // Automation & Utility Tools
    {
      id: 'hookfy',
      image: 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/hookfy/icon.png',
      title: 'hookfy',
      description: 'Android notification monitoring application with webhook support. Enables real-time notification forwarding and tracking for enhanced mobile workflow automation.',
      tags: ['Flutter', 'Mobile', 'Webhooks'],
      category: 'automation',
      link: 'https://github.com/dwvwdv/hookfy',
      technologies: ['Dart', 'Flutter', 'Android SDK', 'HTTP']
    },
    {
      id: 'lazyembed',
      image: '',
      title: 'LazyEmbed',
      description: 'A static webpage utility toolkit featuring various web development tools and helpers. Streamlines common web development tasks with an easy-to-use interface.',
      tags: ['HTML', 'JavaScript', 'Web Tools'],
      category: 'other',
      link: 'https://github.com/dwvwdv/LazyEmbed',
      technologies: ['HTML', 'CSS', 'JavaScript']
    },
    {
      id: 'code-toolbox',
      image: '',
      title: 'CodeToolbox',
      description: 'C++ Qt-based code utility collection. A comprehensive desktop application housing various implemented code functionalities and development tools.',
      tags: ['C++', 'Qt', 'Desktop'],
      category: 'other',
      link: 'https://github.com/dwvwdv/CodeToolbox',
      technologies: ['C++', 'Qt Framework', 'CMake']
    }
  ];

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
