import 'zone.js/node';
import { NgModule } from '@angular/core';
import { ServerModule, renderModule } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
import { Article, FULL_COLUMNS } from './app/services/article.service';
import { PUBLIC_CONTENT, PublicContent } from './app/services/public-content';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './app/services/supabase.config';
import { WebsiteDataService } from './app/services/website-data.service';
export { SITE_URL } from './app/services/seo.config';
export { localizeProject } from './app/page/works/works.component';
export { TRANSLATIONS } from './app/i18n/translations';
export { PRODUCTS, productImages } from './app/products/products';
export type { PublicContent } from './app/services/public-content';

// Used only at build time. Deployment contains static HTML, CSS and browser JavaScript.
@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent]
})
export class AppServerModule {}

/**
 * Reads the public rows with the public key, so row level security limits the build to what any
 * visitor can see. A failed request throws and fails the build: the previous deployment stays
 * live instead of being replaced by pages without projects or articles.
 */
export async function loadPublicContent(): Promise<PublicContent> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=${FULL_COLUMNS}&status=eq.published&order=published_at.desc`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Accept-Profile': 'website' }
  });
  if (!response.ok) {
    throw new Error(`Failed to load published articles (${response.status})`);
  }
  const articles: Article[] = await response.json();
  const projects = await new WebsiteDataService().getProjects();
  return { projects, articles: articles.filter(article => article.status === 'published') };
}

export async function prerender(document: string, url: string, content: PublicContent): Promise<string> {
  return renderModule(AppServerModule, { document, url, extraProviders: [{ provide: PUBLIC_CONTENT, useValue: content }] });
}
