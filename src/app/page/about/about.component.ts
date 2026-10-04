import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../i18n/translate.pipe';

interface TechItem {
  name: string;
  category: string;
  icon: string;
}

@Component({
    selector: 'app-about',
    imports: [CommonModule, TranslatePipe],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  techStack: TechItem[] = [
    // Programming Languages
    { name: 'TypeScript', category: 'about.cat.language', icon: 'fab fa-js-square' },
    { name: 'Python', category: 'about.cat.language', icon: 'fab fa-python' },
    { name: 'C++', category: 'about.cat.language', icon: 'fas fa-code' },
    { name: 'Dart', category: 'about.cat.language', icon: 'fas fa-code' },

    // Frameworks & Libraries
    { name: 'Angular', category: 'about.cat.frontend', icon: 'fab fa-angular' },
    { name: 'Flutter', category: 'about.cat.mobile', icon: 'fas fa-mobile-alt' },
    { name: 'Qt', category: 'about.cat.desktop', icon: 'fas fa-window-maximize' },
    { name: 'Node.js', category: 'about.cat.backend', icon: 'fab fa-node-js' },

    // Game Engine
    { name: 'Godot', category: 'about.cat.gameEngine', icon: 'fas fa-gamepad' },

    // Database & Tools
    { name: 'Oracle', category: 'about.cat.database', icon: 'fas fa-database' },
    { name: 'Docker', category: 'about.cat.devops', icon: 'fab fa-docker' },
    { name: 'Git', category: 'about.cat.vcs', icon: 'fab fa-git-alt' },
    { name: 'Linux', category: 'about.cat.os', icon: 'fab fa-linux' }
  ];

  principles = [
    {
      icon: 'fas fa-flask',
      title: 'about.principle.experimental.title',
      description: 'about.principle.experimental.desc'
    },
    {
      icon: 'fas fa-puzzle-piece',
      title: 'about.principle.crossDomain.title',
      description: 'about.principle.crossDomain.desc'
    },
    {
      icon: 'fas fa-infinity',
      title: 'about.principle.learning.title',
      description: 'about.principle.learning.desc'
    }
  ];
}
