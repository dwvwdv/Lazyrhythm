import 'zone.js/node';
import { NgModule } from '@angular/core';
import { ServerModule, renderModule } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
export { SITE_URL } from './app/services/seo.config';
export { SUPABASE_ANON_KEY, SUPABASE_URL } from './app/services/supabase.config';

// Used only at build time. Deployment contains static HTML, CSS and browser JavaScript.
@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent]
})
export class AppServerModule {}

export async function prerender(document: string, url: string): Promise<string> {
  return renderModule(AppServerModule, { document, url });
}
