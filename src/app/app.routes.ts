import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./page/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'works',
    loadComponent: () => import('./page/works/works.component').then(m => m.WorksComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./page/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'sponsor',
    loadComponent: () => import('./page/sponsor/sponsor.component').then(m => m.SponsorComponent)
  }
]; 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
