import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../../widgets/carousel/carousel.component';

interface Work {
  image: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

@Component({
    selector: 'app-works',
    imports: [CommonModule, CarouselComponent],
    templateUrl: './works.component.html',
    styleUrls: ['./works.component.scss']
})
export class WorksComponent {
  carouselItems = [
    {
      image: 'assets/images/game1.jpg',
      title: '遊戲標題1',
      description: '遊戲描述1'
    },
    {
      image: 'assets/images/game2.jpg',
      title: '遊戲標題2',
      description: '遊戲描述2'
    }
  ];

  works: Work[] = [
    {
      image: 'assets/images/game1.jpg',
      title: '遊戲專案1',
      description: '這是一個充滿冒險的遊戲，玩家將在這裡體驗前所未有的樂趣...',
      tags: ['冒險', 'RPG', '多人遊戲'],
      link: '#'
    },
    {
      image: 'assets/images/game2.jpg',
      title: '遊戲專案2',
      description: '一個策略性的遊戲，考驗玩家的智慧與決策能力...',
      tags: ['策略', '回合制', '單人遊戲'],
      link: '#'
    }
    // 可以添加更多作品
  ];
}
