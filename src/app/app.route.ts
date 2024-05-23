import { Routes } from '@angular/router';
import { AnotherPageComponent } from './another-page/another-page.component';
import { AppComponent } from './app.component';
import { CssMagicComponent } from './css-magic/css-magic.component';
export const routes: Routes = [
  {
    path: 'client',
    title: 'client page.',
    component: AnotherPageComponent,
  },
  {
    path: 'server',
    title: 'server page.',
    component: AppComponent,
  },
  {
    path: 'css-magic',
    title: 'CSS Magic',
    component: CssMagicComponent,
  },
  {
    path: 'get-user',
    title: 'apiUser',
    component: AnotherPageComponent,
  },
];
