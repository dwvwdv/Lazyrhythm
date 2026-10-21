import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { DEFAULT_LANG, languageVersions, localizePath } from '../i18n/lang-path';
import { Lang, SUPPORTED_LANGS } from '../i18n/translations';
import type { Product, ProductContent, ProductImage } from '../products/product.model';
import { Article } from './article.service';
import { PAGE_SEO, SITE_ALTERNATE_NAME, SITE_IMAGE, SITE_IMAGE_SIZE, SITE_NAME, SITE_SAME_AS, SITE_URL, SeoPage } from './seo.config';

@Injectable({ providedIn: 'root' })
export class SeoService implements OnDestroy {
  private readonly subscriptions = new Subscription();
  private started = false;
  private articleContext: { slug: string; article: Article | null; langs: Lang[] } | null = null;
  private productContext: { slug: string; page: ProductSeo | null } | null = null;

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
      if (route.data['seo'] !== 'product' || route.paramMap.get('slug') !== this.productContext?.slug) {
        this.productContext = null;
      }
      this.update();
    }));
    this.subscriptions.add(this.i18n.lang$.subscribe(() => this.update()));
  }

  setArticlePending(slug: string): void {
    this.articleContext = { slug, article: null, langs: [] };
    this.update();
  }

  /** `langs` lists every published language version, so hreflang only names pages that exist. */
  setArticle(article: Article | null, langs: string[] = article ? [article.lang] : []): void {
    if (!this.articleContext) return;
    // A draft or a stale response must never become public metadata.
    const current = article?.status === 'published' && article.slug === this.articleContext.slug ? article : null;
    this.articleContext.article = current;
    this.articleContext.langs = current ? SUPPORTED_LANGS.filter(lang => langs.includes(lang)) : [];
    this.update();
  }

  clearArticle(): void {
    this.articleContext = null;
    this.update();
  }

  /**
   * A product page, or null while the slug has no page (kept noindex). `image` is the social card
   * when its file exists, so a card is never announced before the author exports it.
   */
  setProduct(slug: string, page: ProductSeo | null): void {
    const current = page && page.product.slug === slug ? page : null;
    this.productContext = { slug, page: current };
    this.update();
  }

  clearProduct(): void {
    this.productContext = null;
    this.update();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private update(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const page: SeoPage = this.articleContext ? 'article' : this.productContext ? 'product' : route.data['seo'] ?? 'home';
    const config = PAGE_SEO[page] ?? PAGE_SEO.home;
    const article = this.articleContext?.article;
    const product = this.productContext?.page ?? null;
    const title = `${article?.title || product?.content.title || config.title[this.i18n.lang]} | ${SITE_NAME}`;
    const description = article?.summary?.trim() || product?.content.description || this.i18n.t(config.description);
    const lang = (article?.lang as Lang | undefined) ?? product?.content.lang ?? this.i18n.lang;
    // An article or product shown in its fallback language is canonical at that language's URL.
    const path = this.articleContext
      ? localizePath(`/articles/${encodeURIComponent(this.articleContext.slug)}`, lang)
      : this.productContext
        ? localizePath(`/products/${encodeURIComponent(this.productContext.slug)}`, lang)
        : (this.router.url.split(/[?#]/)[0].replace(/\/+$/, '') || '/');
    const canonical = this.absolute(path);
    const cover = this.imageUrl(article?.cover_image_url) ?? (product?.image ? this.absolute(product.image.file) : null);
    const image = cover ?? SITE_IMAGE;
    const indexable = !config.noindex || !!article || !!product;
    const existing = article ? this.articleContext!.langs : product ? product.product.versions.map(version => version.lang) : null;
    const versions = !indexable ? []
      : existing ? languageVersions(path).filter(version => existing.includes(version.lang))
      : languageVersions(path);

    this.document.title = title;
    this.meta('name', 'description', description);
    this.meta('name', 'robots', indexable ? 'index, follow' : 'noindex, follow');
    this.meta('property', 'og:title', title);
    this.meta('property', 'og:description', description);
    this.meta('property', 'og:type', article ? 'article' : 'website');
    this.meta('property', 'og:url', canonical);
    this.meta('property', 'og:site_name', SITE_NAME);
    this.meta('property', 'og:locale', this.locale(lang));
    this.meta('property', 'og:image', image);
    // Article cover dimensions are unknown; the logo and product cards declare theirs.
    const size = product?.image ? { width: product.image.width, height: product.image.height }
      : cover ? null : { width: SITE_IMAGE_SIZE, height: SITE_IMAGE_SIZE };
    this.meta('property', 'og:image:width', size ? String(size.width) : null);
    this.meta('property', 'og:image:height', size ? String(size.height) : null);
    this.meta('property', 'og:image:alt', product?.image?.alt ?? null);
    this.meta('name', 'twitter:card', cover ? 'summary_large_image' : 'summary');
    this.meta('name', 'twitter:title', title);
    this.meta('name', 'twitter:description', description);
    this.meta('name', 'twitter:image', image);
    this.link('canonical', canonical);
    this.alternates(versions.length > 1 ? versions : [], lang);

    const organization = {
      '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, alternateName: SITE_ALTERNATE_NAME,
      url: `${SITE_URL}/`, logo: SITE_IMAGE, description: this.i18n.t('home.description', lang), sameAs: SITE_SAME_AS
    };
    const website = {
      '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`,
      inLanguage: SUPPORTED_LANGS, publisher: { '@id': organization['@id'] }
    };
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
    if (product) graph.push(...this.productGraph(product, canonical, description, cover, organization['@id'], website['@id']));
    this.jsonLd({ '@context': 'https://schema.org', '@graph': graph });
  }

  /** The page and the app it describes; the app keeps one @id across language versions. */
  private productGraph({ product, content }: ProductSeo, canonical: string, description: string, image: string | null,
    publisher: string, website: string): object[] {
    const app = `${SITE_URL}/products/${encodeURIComponent(product.slug)}#software`;
    return [{
      '@type': 'WebPage', '@id': canonical, url: canonical, name: content.title, description, inLanguage: content.lang,
      isPartOf: { '@id': website }, about: { '@id': app }, dateModified: product.updated,
      ...(image ? { primaryImageOfPage: image } : {})
    }, {
      '@type': 'SoftwareApplication', '@id': app, name: content.name,
      ...(content.alternateName ? { alternateName: content.alternateName } : {}),
      description, url: canonical, mainEntityOfPage: canonical, inLanguage: content.lang,
      applicationCategory: product.applicationCategory, operatingSystem: product.operatingSystem,
      publisher: { '@id': publisher }, author: { '@id': publisher },
      ...(image ? { image } : {}),
      ...(product.installUrl ? { installUrl: product.installUrl, downloadUrl: product.installUrl } : {}),
      ...(product.free ? { offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' } } : {})
    }];
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

  /** hreflang links for every language version plus x-default (the root language). */
  private alternates(versions: Array<{ lang: Lang; path: string }>, current: Lang): void {
    this.document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(node => node.remove());
    this.document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach(node => node.remove());
    if (!versions.length) return;
    const fallback = versions.find(version => version.lang === DEFAULT_LANG) ?? versions[0];
    for (const { lang, path } of [...versions, { lang: 'x-default', path: fallback.path }]) {
      const node = this.document.createElement('link');
      node.setAttribute('rel', 'alternate');
      node.setAttribute('hreflang', lang);
      node.setAttribute('href', this.absolute(path));
      this.document.head.appendChild(node);
    }
    for (const { lang } of versions.filter(version => version.lang !== current)) {
      const node = this.document.createElement('meta');
      node.setAttribute('property', 'og:locale:alternate');
      node.setAttribute('content', this.locale(lang));
      this.document.head.appendChild(node);
    }
  }

  private absolute(path: string): string {
    return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
  }

  private locale(lang: Lang): string {
    return lang === 'zh-TW' ? 'zh_TW' : 'en_US';
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

export interface ProductSeo {
  product: Product;
  content: ProductContent;
  /** The social card when its file exists. */
  image: ProductImage | null;
}
