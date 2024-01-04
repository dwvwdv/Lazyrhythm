import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'lazyrhythm';
  topList = ['Web Security', 'FrontEnd', 'BackEnd', 'Testing', 'Ops',]
  user = 'dwvwdv';
  pic = 'https://picsum.photos/200/300';
  aaa: string[] = ['a', 'aa', 'aaa'];
  // @Input() items: string[] = [''];


  getPicture = function() {
    fetch("https://picsum.photos/200/300")
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  showMenu = function(topItemName: string) {
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
        'CSS Beautiful',
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
    // housingService: HousingService = inject(HousingService);
    // let menuComponent: MenuComponent = inject(menuService);
    // let menuComponent: MenuComponent = new MenuComponent(hoverList[topItemName]);
    // c.items = hoverList[topItemName];

    console.log(hoverList[topItemName]);
  }
}
