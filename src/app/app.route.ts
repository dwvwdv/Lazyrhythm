import { Routes } from '@angular/router';
import { AnotherPageComponent } from './another-page/another-page.component';
import { AppComponent } from './app.component';
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
];
