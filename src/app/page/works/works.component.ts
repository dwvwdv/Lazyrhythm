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
    // Financial Tech Projects
    {
      id: 'crypto-bot',
      image: 'assets/images/crypto-bot.jpg',
      title: 'Crypto Trading Bot',
      description: 'Automated cryptocurrency trading system with advanced market analysis, risk management, and multi-exchange support.',
      tags: ['Python', 'Machine Learning', 'API Integration'],
      category: 'finance',
      link: '#',
      technologies: ['Python', 'TensorFlow', 'CCXT', 'PostgreSQL']
    },
    {
      id: 'portfolio-tracker',
      image: 'assets/images/portfolio.jpg',
      title: 'Portfolio Analytics Dashboard',
      description: 'Real-time investment portfolio tracking with advanced analytics, performance metrics, and risk assessment.',
      tags: ['React', 'D3.js', 'Real-time Data'],
      category: 'finance',
      link: '#',
      technologies: ['React', 'TypeScript', 'D3.js', 'WebSocket']
    },

    // Gaming Projects
    {
      id: 'rhythm-game',
      image: 'assets/images/rhythm-game.jpg',
      title: 'LazyBeat',
      description: 'Experimental rhythm game with procedurally generated levels that sync to your music library.',
      tags: ['Unity', 'C#', 'Audio Processing'],
      category: 'gaming',
      link: '#',
      technologies: ['Unity', 'C#', 'FMOD', 'Blender']
    },
    {
      id: 'puzzle-game',
      image: 'assets/images/puzzle.jpg',
      title: 'Quantum Puzzles',
      description: 'Mind-bending puzzle game exploring quantum mechanics concepts through interactive gameplay.',
      tags: ['Game Design', 'Physics', 'Education'],
      category: 'gaming',
      link: '#',
      technologies: ['Unity', 'C#', 'Shader Graph']
    },

    // Security Tools
    {
      id: 'network-scanner',
      image: 'assets/images/network-scanner.jpg',
      title: 'NetRecon',
      description: 'Comprehensive network reconnaissance tool for penetration testing and security audits.',
      tags: ['Rust', 'Networking', 'Security'],
      category: 'security',
      link: '#',
      technologies: ['Rust', 'Nmap', 'Wireshark API']
    },
    {
      id: 'password-auditor',
      image: 'assets/images/password-audit.jpg',
      title: 'PasswordShield Auditor',
      description: 'Enterprise password policy auditing tool with breach detection and strength analysis.',
      tags: ['Python', 'Cryptography', 'CLI'],
      category: 'security',
      link: '#',
      technologies: ['Python', 'Hashcat', 'SQLite']
    },
    {
      id: 'vuln-scanner',
      image: 'assets/images/vuln-scanner.jpg',
      title: 'WebVuln Scanner',
      description: 'Automated web application vulnerability scanner for OWASP Top 10 security issues.',
      tags: ['Security', 'Web', 'Automation'],
      category: 'security',
      link: '#',
      technologies: ['Python', 'Selenium', 'BeautifulSoup']
    },

    // Automation Projects
    {
      id: 'workflow-automation',
      image: 'assets/images/workflow.jpg',
      title: 'FlowMaster',
      description: 'Visual workflow automation platform for complex business processes and API integrations.',
      tags: ['Node.js', 'Automation', 'Low-Code'],
      category: 'automation',
      link: '#',
      technologies: ['Node.js', 'React', 'MongoDB', 'Redis']
    },
    {
      id: 'data-pipeline',
      image: 'assets/images/data-pipeline.jpg',
      title: 'DataFlow Pipeline',
      description: 'Scalable data processing pipeline with ETL capabilities and real-time monitoring.',
      tags: ['Python', 'Big Data', 'Cloud'],
      category: 'automation',
      link: '#',
      technologies: ['Python', 'Apache Airflow', 'AWS', 'Docker']
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
