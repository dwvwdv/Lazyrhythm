import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authorGuard } from './services/author.guard';

const pages: Routes = [
  {
    path: '',
    data: { seo: 'home' },
    loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'articles',
    data: { seo: 'articles' },
    loadComponent: () => import('./page/articles/article-list/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'articles/manage',
    data: { seo: 'manage' },
    loadComponent: () => import('./page/articles/article-manage/article-manage.component').then(m => m.ArticleManageComponent)
  },
  {
    path: 'articles/manage/new',
    data: { seo: 'manage' },
    canActivate: [authorGuard],
    loadComponent: () => import('./page/articles/article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: 'articles/manage/:id',
    data: { seo: 'manage' },
    canActivate: [authorGuard],
    loadComponent: () => import('./page/articles/article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: 'articles/:slug',
    data: { seo: 'article' },
    loadComponent: () => import('./page/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
  },
  {
    path: 'art',
    data: { seo: 'art' },
    loadComponent: () => import('./page/art/art.component').then(m => m.ArtComponent)
  },
  {
    path: 'about',
    data: { seo: 'about' },
    loadComponent: () => import('./page/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'works',
    data: { seo: 'works' },
    loadComponent: () => import('./page/works/works.component').then(m => m.WorksComponent)
  },
  {
    path: 'contact',
    data: { seo: 'contact' },
    loadComponent: () => import('./page/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'sponsor',
    data: { seo: 'sponsor' },
    loadComponent: () => import('./page/sponsor/sponsor.component').then(m => m.SponsorComponent)
  },
  // The host answers unknown paths with HTTP 404 and the same page.
  {
    path: '**',
    data: { seo: 'notFound' },
    loadComponent: () => import('./page/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

// The same pages in each language: 中文 at the site root, English under /en.
export const routes: Routes = [
  { path: 'en', children: pages },
  { path: '', children: pages }
];

@NgModule({
  // Start each page at the top; back/forward restores the previous position.
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
