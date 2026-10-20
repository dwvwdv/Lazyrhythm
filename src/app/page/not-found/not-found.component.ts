import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { LocalizePipe } from '../../i18n/localize.pipe';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, TranslatePipe, LocalizePipe],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
}
