import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  topList = ['Web Security', 'FrontEnd', 'BackEnd', 'Testing', 'Ops',];
  items: string[] = [];
  myWebSite = "http://google.com";
  // @Input() items: string[] = [];

  constructor() {
    // this.items = ['Web Page', 'Server', 'Active Directory'];
  }


  getItemLink(item: string = 'Default') {
    let url: { [key: string]: string } = {
      'Client': '/client',
      'Server': '/server',
      'Active Directory': '/activeDirectory',
      'CSS Magic': '/css-magic'
    }
    return url[item];
  }

  showMenu(topItemName: string, idx: number) {
    let hoverList: { [key: string]: string[] } = {
      'Web Security': [
        'Client',
        'Server',
        'Active Directory'
      ],
      'FrontEnd': [
        'Basic',
        'Framework',
        'Packet',
        'CSS Magic',
      ],
      'BackEnd': [
        'Authorize',
        'Database',
        'Architecture',
      ],
      'Testing': [
        'Unit Test',
        'Intergration Test',
        'End to end Test',
        'Smoke Test',
        'Regression Test',
      ],
      'Ops': [
        'Cloud',
        'Docker',
        'Git',
      ],
    };
    this.items = hoverList[topItemName];
    let menuDom = document.getElementsByClassName('menu') as HTMLCollectionOf<HTMLElement>;
    let topContentDom = document.getElementsByClassName('top-content-button') as HTMLCollectionOf<HTMLElement>;
    menuDom[0].style.display = 'grid';
    menuDom[0].style.top = `${topContentDom[idx].offsetTop + 40}px`;
    menuDom[0].style.left = `${topContentDom[idx].offsetLeft - 40}px`;

  }
}
