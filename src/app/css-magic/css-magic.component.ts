import { Component } from '@angular/core';

@Component({
  selector: 'app-css-magic',
  standalone: true,
  imports: [],
  templateUrl: './css-magic.component.html',
  styleUrl: './css-magic.component.scss'
})
export class CssMagicComponent {
  filter_xy = "0 0.5";

  ngOnInit() {
    setInterval(() => {

      let x = Math.random();
      let y = Math.random();
      this.filter_xy = `0 ${y}`;
    }, 150);
  }

}
