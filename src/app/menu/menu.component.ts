import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  constructor() {
    // this.items = ['Web Page', 'Server', 'Active Directory'];
  }
  test = 'menu component.';
  myWebSite = "http://google.com";
  @Input() items: string[] = [''];
}
