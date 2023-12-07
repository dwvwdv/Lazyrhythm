import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'lazyrhythm';
  topList = ['Web Security', 'FrontEnd', 'BackEnd', 'Testing', 'Ops',]
  user = 'dwvwdv';
  pic = 'picTest';

  getCat = function() {
    fetch("https://picsum.photos/200/300")
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
}
