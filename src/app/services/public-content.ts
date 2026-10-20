import { Inject, Injectable, InjectionToken, Optional, StateKey, TransferState, makeStateKey } from '@angular/core';
import { Article, ArticleSummary } from './article.service';
import { WebsiteProjectRow } from './website-data.service';

/** The public rows the build read from Supabase: projects and every published article version. */
export interface PublicContent {
  projects: WebsiteProjectRow[];
  articles: Article[];
}

/** Provided only while prerendering, so the static HTML contains the real content. */
export const PUBLIC_CONTENT = new InjectionToken<PublicContent>('PUBLIC_CONTENT');

export const PROJECTS_STATE = makeStateKey<WebsiteProjectRow[]>('projects');
export const ARTICLES_STATE = makeStateKey<ArticleSummary[]>('articles');
export const articleState = (slug: string) => makeStateKey<Article[]>(`article:${slug}`);

/**
 * Content rendered into the current page. While prerendering it comes from the build and is
 * written into the page's transfer state; the browser reads it back from there, so hydration
 * renders exactly the server's DOM before any live request finishes.
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
    return this.state.get(key, null);
  }
}

export function summarize({ content, ...summary }: Article): ArticleSummary {
  return summary;
}
