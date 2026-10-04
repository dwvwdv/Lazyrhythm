import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authorGuard } from './services/author.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./page/articles/article-list/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'articles/manage',
    loadComponent: () => import('./page/articles/article-manage/article-manage.component').then(m => m.ArticleManageComponent)
  },
  {
    path: 'articles/manage/new',
    canActivate: [authorGuard],
    loadComponent: () => import('./page/articles/article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: 'articles/manage/:id',
    canActivate: [authorGuard],
    loadComponent: () => import('./page/articles/article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: 'articles/:slug',
    loadComponent: () => import('./page/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
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
