import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  techStack: TechItem[] = [
    // Programming Languages
    { name: 'TypeScript', category: 'Language', icon: 'fab fa-js-square' },
    { name: 'Python', category: 'Language', icon: 'fab fa-python' },
    { name: 'C++', category: 'Language', icon: 'fas fa-code' },
    { name: 'Dart', category: 'Language', icon: 'fas fa-code' },

    // Frameworks & Libraries
    { name: 'Angular', category: 'Frontend', icon: 'fab fa-angular' },
    { name: 'Flutter', category: 'Mobile', icon: 'fas fa-mobile-alt' },
    { name: 'Qt', category: 'Desktop', icon: 'fas fa-window-maximize' },
    { name: 'Node.js', category: 'Backend', icon: 'fab fa-node-js' },

    // Game Engine
    { name: 'Godot', category: 'Game Engine', icon: 'fas fa-gamepad' },

    // Database & Tools
    { name: 'Oracle', category: 'Database', icon: 'fas fa-database' },
    { name: 'Docker', category: 'DevOps', icon: 'fab fa-docker' },
    { name: 'Git', category: 'Version Control', icon: 'fab fa-git-alt' },
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
