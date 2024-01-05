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
  test = '1111'
}
