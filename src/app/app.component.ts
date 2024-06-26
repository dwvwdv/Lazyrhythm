import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Lazyrhythm';

  getPicture = function() {
    fetch("https://picsum.photos/200/300")
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

}
