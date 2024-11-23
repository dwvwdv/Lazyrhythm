import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

interface TechItem {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  timelineEvents: TimelineEvent[] = [
    {
      date: '2023',
      title: 'LazyRhythm 成立',
      description: '開始獨立遊戲開發之旅'
    },
    {
      date: '2024',
      title: '首款遊戲發布',
      description: '發布第一款獨立遊戲作品'
    }
  ];

  techStack: TechItem[] = [
    {
      name: 'Unity',
      icon: 'assets/icons/unity.png'
    },
    {
      name: 'C#',
      icon: 'assets/icons/csharp.png'
    },
    {
      name: 'Blender',
      icon: 'assets/icons/blender.png'
    },
    {
      name: 'TypeScript',
      icon: 'assets/icons/typescript.png'
    }
  ];
}
