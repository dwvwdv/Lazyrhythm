import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { Article } from './article.service';
import { PAGE_SEO, SITE_IMAGE, SITE_IMAGE_SIZE, SITE_NAME, SITE_URL, SeoPage } from './seo.config';

@Injectable({ providedIn: 'root' })
export class SeoService implements OnDestroy {
  private readonly subscriptions = new Subscription();
  private started = false;
  private articleContext: { slug: string; article: Article | null } | null = null;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router,
    private readonly i18n: I18nService
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;
    this.subscriptions.add(this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.router.routerState.snapshot.root;
      while (route.firstChild) route = route.firstChild;
      if (route.data['seo'] !== 'article' || route.paramMap.get('slug') !== this.articleContext?.slug) {
        this.articleContext = null;
      }
      this.update();
    }));
    this.subscriptions.add(this.i18n.lang$.subscribe(() => this.update()));
  }

  setArticlePending(slug: string): void {
    this.articleContext = { slug, article: null };
    this.update();
  }

  setArticle(article: Article | null): void {
    if (!this.articleContext) return;
    // A draft or a stale response must never become public metadata.
    this.articleContext.article = article?.status === 'published' && article.slug === this.articleContext.slug ? article : null;
    this.update();
  }

  clearArticle(): void {
    this.articleContext = null;
    this.update();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const page: SeoPage = this.articleContext ? 'article' : route.data['seo'] ?? 'home';
    const config = PAGE_SEO[page] ?? PAGE_SEO.home;
    const article = this.articleContext?.article;
    const title = `${article?.title || config.title[this.i18n.lang]} | ${SITE_NAME}`;
    const description = article?.summary?.trim() || this.i18n.t(config.description);
    const path = this.articleContext
      ? `/articles/${encodeURIComponent(this.articleContext.slug)}`
      : (this.router.url.split(/[?#]/)[0].replace(/\/+$/, '') || '/');
    const canonical = `${SITE_URL}/${path.replace(/^\/+/, '')}`;
    const cover = this.imageUrl(article?.cover_image_url);
    const image = cover ?? SITE_IMAGE;
    const lang = article?.lang ?? this.i18n.lang;

    this.document.title = title;
    this.meta('name', 'description', description);
    this.meta('name', 'robots', config.noindex && !article ? 'noindex, follow' : 'index, follow');
    this.meta('property', 'og:title', title);
    this.meta('property', 'og:description', description);
    this.meta('property', 'og:type', article ? 'article' : 'website');
    this.meta('property', 'og:url', canonical);
    this.meta('property', 'og:site_name', SITE_NAME);
    this.meta('property', 'og:locale', lang === 'zh-TW' ? 'zh_TW' : 'en_US');
    this.meta('property', 'og:image', image);
    // Cover dimensions are unknown, so only the logo declares its size.
    const size = cover ? null : String(SITE_IMAGE_SIZE);
    this.meta('property', 'og:image:width', size);
    this.meta('property', 'og:image:height', size);
    this.meta('name', 'twitter:card', cover ? 'summary_large_image' : 'summary');
    this.meta('name', 'twitter:title', title);
    this.meta('name', 'twitter:description', description);
    this.meta('name', 'twitter:image', image);
    this.link('canonical', canonical);

    const organization = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: `${SITE_URL}/`, logo: SITE_IMAGE };
    const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, publisher: { '@id': organization['@id'] } };
    const graph: object[] = [organization, website];
    if (article) {
      graph.push({
        '@type': 'Article', '@id': `${canonical}#article`, mainEntityOfPage: canonical,
        headline: article.title, description, inLanguage: article.lang,
        publisher: { '@id': organization['@id'] },
        ...(cover ? { image: cover } : {}),
        ...(article.author_name?.trim() ? { author: { '@type': 'Person', name: article.author_name } } : {}),
        ...(this.validDate(article.published_at) ? { datePublished: article.published_at } : {}),
        ...(this.validDate(article.updated_at) ? { dateModified: article.updated_at } : {})
      });
    }
    this.jsonLd({ '@context': 'https://schema.org', '@graph': graph });
  }

  /** A null content removes the tag. */
  private meta(attribute: 'name' | 'property', key: string, content: string | null): void {
    const nodes = Array.from(this.document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`));
    if (content === null) {
      nodes.forEach(node => node.remove());
      return;
    }
    const node = nodes.shift() ?? this.document.createElement('meta');
    nodes.forEach(duplicate => duplicate.remove());
    node.setAttribute(attribute, key);
    node.setAttribute('content', content);
    if (!node.parentNode) this.document.head.appendChild(node);
  }

  private link(rel: string, href: string): void {
    const nodes = Array.from(this.document.head.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`));
    const node = nodes.shift() ?? this.document.createElement('link');
    nodes.forEach(duplicate => duplicate.remove());
    node.setAttribute('rel', rel);
    node.setAttribute('href', href);
    if (!node.parentNode) this.document.head.appendChild(node);
  }

  private jsonLd(value: object): void {
    const nodes = Array.from(this.document.head.querySelectorAll<HTMLScriptElement>('script[data-seo="structured-data"]'));
    const script = nodes.shift() ?? this.document.createElement('script');
    nodes.forEach(duplicate => duplicate.remove());
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'structured-data');
    // Escaping '<' prevents stored content from closing the script in serialized SSR HTML.
    script.textContent = JSON.stringify(value).replace(/</g, '\\u003c');
    if (!script.parentNode) this.document.head.appendChild(script);
  }

  private imageUrl(value: string | null | undefined): string | null {
    if (!value?.trim()) return null;
    try {
      const url = new URL(value, `${SITE_URL}/`);
      return /^https?:$/.test(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  private validDate(value: string | null): boolean {
    return !!value && Number.isFinite(Date.parse(value));
  }
}
