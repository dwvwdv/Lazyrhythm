import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface TechItem {
  name: string;
  category: string;
  icon: string;
}

@Component({
    selector: 'app-about',
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  timelineEvents: TimelineEvent[] = [
    {
      date: '2020',
      title: 'Lab Inception',
      description: 'Started experimenting with various technologies and building cross-domain projects'
    },
    {
      date: '2021',
      title: 'First Trading Bot',
      description: 'Developed first automated trading system for cryptocurrency markets'
    },
    {
      date: '2022',
      title: 'Game Development Focus',
      description: 'Expanded into interactive game mechanics and experimental gameplay'
    },
    {
      date: '2023',
      title: 'Security Tools Suite',
      description: 'Created collection of cybersecurity utilities and penetration testing tools'
    },
    {
      date: '2024',
      title: 'Full-Stack Innovation',
      description: 'Integrated all domains: fintech, gaming, security, and automation into unified ecosystem'
    }
  ];

  techStack: TechItem[] = [
    // Programming Languages
    { name: 'TypeScript', category: 'Language', icon: 'fab fa-js-square' },
    { name: 'Python', category: 'Language', icon: 'fab fa-python' },
    { name: 'C#', category: 'Language', icon: 'fas fa-code' },
    { name: 'Rust', category: 'Language', icon: 'fas fa-cube' },

    // Frameworks & Libraries
    { name: 'Angular', category: 'Frontend', icon: 'fab fa-angular' },
    { name: 'React', category: 'Frontend', icon: 'fab fa-react' },
    { name: 'Node.js', category: 'Backend', icon: 'fab fa-node-js' },
    { name: 'Unity', category: 'Game Engine', icon: 'fab fa-unity' },

    // Tools & Platforms
    { name: 'Docker', category: 'DevOps', icon: 'fab fa-docker' },
    { name: 'Git', category: 'Version Control', icon: 'fab fa-git-alt' },
    { name: 'AWS', category: 'Cloud', icon: 'fab fa-aws' },
    { name: 'Linux', category: 'OS', icon: 'fab fa-linux' }
  ];

  principles = [
    {
      icon: 'fas fa-flask',
      title: 'Experimental',
      description: 'Every project is an experiment. Failure is data, success is a bonus.'
    },
    {
      icon: 'fas fa-puzzle-piece',
      title: 'Cross-Domain',
      description: 'Merging insights from finance, gaming, security, and automation.'
    },
    {
      icon: 'fas fa-infinity',
      title: 'Continuous Learning',
      description: 'Technology evolves, and so does this lab. Always exploring, always building.'
    }
  ];
}
