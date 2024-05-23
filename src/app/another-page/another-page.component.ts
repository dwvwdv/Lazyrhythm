import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-another-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './another-page.component.html',
  styleUrl: './another-page.component.scss'
})
export class AnotherPageComponent {
  user: string = 'None';
  rst: string = 'rst';
  getUser = () => {
    fetch('/user/foo')
      .then(response => response.json())
      .then(result => {
        this.user = result.user;
        console.log(result);
      })
      .catch(error => console.log('error', error));
  }
  getRemote = () => {
    fetch('/api/todo2_16')
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => console.log('error', error));
  }
  // getUser() {
  //   this.http.get('/user/foo').subscribe(
  //     (data: any) => {
  //       this.user = data.user;
  //       console.log(data);
  //     },
  //     (error: any) => {
  //       console.error('error', error);
  //     }
  //   );
  // }
  // getUser() {
  //   this.user = "hi";
  //   console.log('hi');
  // }
  // getUser(this: AnotherPageComponent) {
  //   fetch('http://localhost:8080/user/foo')
  //     .then(response => response.json())
  //     .then(result => {
  //       this.user = result.user;
  //       console.log(result);
  //     })
  //     .catch(error => console.log('error', error));
  // }
}
