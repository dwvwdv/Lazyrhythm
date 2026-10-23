import { Inject, Injectable, InjectionToken, Optional, StateKey, TransferState, makeStateKey } from '@angular/core';
import { Article, ArticleSummary } from './article.service';
import { WebsiteProjectRow } from './website-data.service';

/** The public rows the build read from Supabase: projects and every published article version. */
export interface PublicContent {
  projects: WebsiteProjectRow[];
  articles: Article[];
  /** Remote image URLs and local image files present in the build output. */
  productAssets?: string[];
}

/** Provided only while prerendering, so the static HTML contains the real content. */
export const PUBLIC_CONTENT = new InjectionToken<PublicContent>('PUBLIC_CONTENT');

export const PROJECTS_STATE = makeStateKey<WebsiteProjectRow[]>('projects');
export const ARTICLES_STATE = makeStateKey<ArticleSummary[]>('articles');
export const articleState = (slug: string) => makeStateKey<Article[]>(`article:${slug}`);
export const productAssetsState = (slug: string) => makeStateKey<string[]>(`product-assets:${slug}`);
export const productArticlesState = (slug: string) => makeStateKey<ArticleSummary[]>(`product-articles:${slug}`);

/**
 * Content rendered into the current page. While prerendering it comes from the build and is
 * written into the page's transfer state; the browser reads it back from there, so hydration
 * renders exactly the server's DOM before any live request finishes. The browser removes each
 * entry on first use, so later in-app visits load live data instead of the build snapshot.
 */
@Injectable({ providedIn: 'root' })
export class PrerenderedContent {
  constructor(
    private readonly state: TransferState,
    @Optional() @Inject(PUBLIC_CONTENT) private readonly content: PublicContent | null
  ) {}

  /** True while prerendering: pages render the build's rows and make no requests. */
  get isPrerendering(): boolean {
    return !!this.content;
  }

  take<T>(key: StateKey<T>, pick: (content: PublicContent) => T): T | null {
    if (this.content) {
      const value = pick(this.content);
      this.state.set(key, value);
      return value;
    }
    const value = this.state.get(key, null);
    this.state.remove(key);
    return value;
  }
}

export function summarize({ content, ...summary }: Article): ArticleSummary {
  return summary;
}
