import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  constructor() {
    // this.items = ['Web Page', 'Server', 'Active Directory'];
  }

  test = 'menu component.';
  myWebSite = "http://google.com";
  @Input() items: string[] = [];

  getItemLink(item: string = 'Default') {
    let url: { [key: string]: string } = {
      'Client': '/client',
      'Server': '/server',
      'Active Directory': '/activeDirectory',
    }
    return url[item];
  }
}
