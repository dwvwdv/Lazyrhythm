import { convertToParamMap, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { Lang, TRANSLATIONS, TranslationKey } from '../i18n/translations';
import { Article } from './article.service';
import { SITE_URL } from './seo.config';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let doc: Document;
  let service: SeoService;
  let lang: BehaviorSubject<Lang>;
  let events: Subject<NavigationEnd>;
  let router: { url: string; events: Subject<NavigationEnd>; routerState: { snapshot: { root: object } } };

  function navigate(page: string, url: string, slug?: string): void {
    router.url = url;
    router.routerState.snapshot.root = { data: { seo: page }, paramMap: convertToParamMap({ slug }), firstChild: null };
    events.next(new NavigationEnd(1, url, url));
  }
  function meta(key: string): string | null {
    return doc.head.querySelector(`meta[name="${key}"],meta[property="${key}"]`)?.getAttribute('content') ?? null;
  }
  function graph(): any[] {
    return JSON.parse(doc.head.querySelector('script[data-seo]')!.textContent!)['@graph'];
  }
  function article(overrides: Partial<Article> = {}): Article {
    return { id: '1', slug: 'hello', title: 'A published experiment', summary: 'Actual article summary', cover_image_url: '/assets/cover.png',
      lang: 'en', status: 'published', tags: [], published_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-02T00:00:00Z',
      author_name: null, content: '# Hello', ...overrides };
  }

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('');
    lang = new BehaviorSubject<Lang>('en');
    events = new Subject<NavigationEnd>();
    router = { url: '/', events, routerState: { snapshot: { root: { data: { seo: 'home' }, firstChild: null } } } };
    const i18n = { lang$: lang.asObservable(), get lang() { return lang.value; }, t: (key: TranslationKey) => TRANSLATIONS[lang.value][key] };
    service = new SeoService(doc, router as unknown as Router, i18n as unknown as I18nService);
    service.start();
  });
  afterEach(() => service.ngOnDestroy());

  function hreflang(): Record<string, string> {
    return Object.fromEntries(Array.from(doc.head.querySelectorAll('link[rel="alternate"][hreflang]'))
      .map(node => [node.getAttribute('hreflang')!, node.getAttribute('href')!]));
  }

  it('gives each language its own canonical, strips query/hash, and links both versions with 中文 as x-default', () => {
    navigate('works', '/en/works/?filter=security#projects');
    expect(doc.title).toBe('Projects | LazyRhythm');
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/en/works`);
    expect(meta('og:url')).toBe(`${SITE_URL}/en/works`);
    expect(meta('og:locale')).toBe('en_US');
    expect(meta('og:locale:alternate')).toBe('zh_TW');
    const versions = { 'zh-TW': `${SITE_URL}/works`, en: `${SITE_URL}/en/works`, 'x-default': `${SITE_URL}/works` };
    expect(hreflang()).toEqual(versions);

    lang.next('zh-TW');
    navigate('works', '/works');
    expect(doc.title).toBe('作品 | LazyRhythm');
    expect(meta('description')).toBe(TRANSLATIONS['zh-TW']['works.subtitle']);
    expect(meta('og:locale')).toBe('zh_TW');
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/works`);
    expect(hreflang()).toEqual(versions);
    expect(doc.head.querySelectorAll('link[hreflang]').length).toBe(3);
    expect(graph().map(node => node['@type'])).toEqual(['Organization', 'WebSite']);

    lang.next('en');
    navigate('home', '/en');
    expect(hreflang()).toEqual({ 'zh-TW': `${SITE_URL}/`, en: `${SITE_URL}/en`, 'x-default': `${SITE_URL}/` });
  });

  it('names only the article languages that exist and canonicalises a fallback to its own language', () => {
    navigate('article', '/en/articles/hello', 'hello');
    service.setArticlePending('hello');
    service.setArticle(article({ lang: 'en' }), ['zh-TW', 'en']);
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/en/articles/hello`);
    expect(hreflang()).toEqual({
      'zh-TW': `${SITE_URL}/articles/hello`, en: `${SITE_URL}/en/articles/hello`, 'x-default': `${SITE_URL}/articles/hello`
    });

    // Only a 中文 version: the English URL shows it, so it points search engines at the 中文 URL.
    service.setArticle(article({ lang: 'zh-TW' }), ['zh-TW']);
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/articles/hello`);
    expect(meta('og:locale')).toBe('zh_TW');
    expect(doc.head.querySelector('link[hreflang]')).toBeNull();

    navigate('manage', '/en/articles/manage');
    expect(doc.head.querySelector('link[hreflang]')).toBeNull();
  });

  it('replaces stale article metadata for pending, missing, draft, management and subsequent public routes', () => {
    navigate('article', '/articles/hello', 'hello');
    service.setArticlePending('hello');
    expect(meta('robots')).toBe('noindex, follow');
    service.setArticle(article());
    expect(doc.title).toBe('A published experiment | LazyRhythm');
    expect(meta('description')).toBe('Actual article summary');
    expect(meta('og:image')).toBe(`${SITE_URL}/assets/cover.png`);
    expect(meta('og:image:width')).toBeNull();
    expect(meta('twitter:card')).toBe('summary_large_image');
    expect(meta('robots')).toBe('index, follow');
    const structuredArticle = graph().find(node => node['@type'] === 'Article');
    expect(structuredArticle.headline).toBe('A published experiment');
    expect(structuredArticle.author).toBeUndefined();
    expect(structuredArticle.datePublished).toBe('2026-10-01T00:00:00Z');

    service.setArticlePending('missing');
    expect(doc.title).toBe('Article | LazyRhythm');
    expect(meta('robots')).toBe('noindex, follow');
    expect(meta('og:image')).toBe(`${SITE_URL}/assets/logo.png`);
    expect(meta('og:image:width')).toBe('1024');
    expect(meta('og:image:height')).toBe('1024');
    expect(meta('twitter:card')).toBe('summary');
    expect(graph().some(node => node['@type'] === 'Article')).toBeFalse();
    expect(meta('og:url')).toBe(`${SITE_URL}/en/articles/missing`);
    service.setArticle(article({ slug: 'missing', status: 'draft' }));
    expect(meta('robots')).toBe('noindex, follow');
    service.setArticle(article()); // Previous slug cannot replace the current page.
    expect(doc.title).toBe('Article | LazyRhythm');
    navigate('manage', '/articles/manage/new');
    expect(meta('robots')).toBe('noindex, follow');
    navigate('about', '/about');
    expect(meta('robots')).toBe('index, follow');
    expect(meta('og:type')).toBe('website');
    expect(doc.title).toBe('About | LazyRhythm');
  });

  it('uses the displayed article language and safely serializes user-provided structured data', () => {
    service.setArticlePending('hello');
    service.setArticle(article({ title: '</script><script>alert(1)</script>', lang: 'zh-TW', cover_image_url: 'javascript:alert(1)', author_name: 'Real Author', updated_at: 'bad-date' }));
    expect(meta('og:locale')).toBe('zh_TW');
    expect(meta('og:image')).toBe(`${SITE_URL}/assets/logo.png`);
    expect(doc.head.querySelectorAll('script').length).toBe(1);
    expect(doc.head.querySelector('script')!.textContent).not.toContain('</script>');
    const structuredArticle = graph().find(node => node['@type'] === 'Article');
    expect(structuredArticle.inLanguage).toBe('zh-TW');
    expect(structuredArticle.author.name).toBe('Real Author');
    expect(structuredArticle.image).toBeUndefined();
    expect(structuredArticle.dateModified).toBeUndefined();
  });

  it('deduplicates existing head tags and remains idempotent when started twice', () => {
    doc.head.insertAdjacentHTML('beforeend', '<meta name="description" content="stale"><link rel="canonical" href="https://stale.invalid">');
    service.start();
    navigate('contact', '/contact');
    expect(doc.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.head.querySelectorAll('script[data-seo]').length).toBe(1);
  });
});
