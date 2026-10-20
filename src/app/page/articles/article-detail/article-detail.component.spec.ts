import { TransferState } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { I18nService } from '../../../i18n/i18n.service';
import { Lang } from '../../../i18n/translations';
import { Article, ArticleService } from '../../../services/article.service';
import { SeoService } from '../../../services/seo.service';
import { PrerenderedContent, PublicContent, articleState } from '../../../services/public-content';
import { ArticleDetailComponent } from './article-detail.component';

describe('ArticleDetailComponent loading and SEO', () => {
  let component: ArticleDetailComponent;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let lang: BehaviorSubject<Lang>;
  let articles: jasmine.SpyObj<ArticleService>;
  let seo: jasmine.SpyObj<SeoService>;
  let state: TransferState;
  let create: (content?: PublicContent) => ArticleDetailComponent;

  function article(slug: string, language: Lang = 'en', status: 'published' | 'draft' = 'published'): Article {
    return { id: `${slug}-${language}`, slug, lang: language, status, title: `${slug} ${language}`, summary: 'Summary', content: '# Article',
      tags: [], cover_image_url: null, published_at: null, updated_at: '', author_name: null };
  }
  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
  }
  async function settle(): Promise<void> { await Promise.resolve(); await Promise.resolve(); }

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'first' }));
    lang = new BehaviorSubject<Lang>('en');
    articles = jasmine.createSpyObj<ArticleService>('ArticleService', ['getPublishedVersions']);
    seo = jasmine.createSpyObj<SeoService>('SeoService', ['setArticlePending', 'setArticle', 'clearArticle']);
    const i18n = { lang$: lang.asObservable(), get lang() { return lang.value; } };
    state = new TransferState();
    create = content => new ArticleDetailComponent({ paramMap: params.asObservable() } as ActivatedRoute, articles, i18n as I18nService, seo,
      new PrerenderedContent(state, content ?? null));
    component = create();
  });
  afterEach(() => component.ngOnDestroy());

  it('ignores an older successful request after a rapid slug change', async () => {
    const first = deferred<Article[]>();
    const second = deferred<Article[]>();
    articles.getPublishedVersions.and.returnValues(first.promise, second.promise);
    component.ngOnInit();
    params.next(convertToParamMap({ slug: 'second' }));
    second.resolve([article('second')]);
    await settle();
    expect(component.article?.slug).toBe('second');
    expect(component.isLoading).toBeFalse();
    first.resolve([article('first')]);
    await settle();
    expect(component.article?.slug).toBe('second');
    expect(seo.setArticle.calls.mostRecent().args[0]?.slug).toBe('second');
  });

  it('does not let an older failure clear the loading state or set an error on the new request', async () => {
    const first = deferred<Article[]>();
    const second = deferred<Article[]>();
    articles.getPublishedVersions.and.returnValues(first.promise, second.promise);
    component.ngOnInit();
    params.next(convertToParamMap({ slug: 'second' }));
    first.reject(new Error('Old failure'));
    await settle();
    expect(component.loadError).toBeFalse();
    expect(component.isLoading).toBeTrue();
    second.resolve([]);
    await settle();
    expect(component.isLoading).toBeFalse();
    expect(component.article).toBeNull();
    expect(seo.setArticle.calls.mostRecent().args[0]).toBeNull();
  });

  it('switches actual published translations and removes content immediately while the next slug loads', async () => {
    const next = deferred<Article[]>();
    articles.getPublishedVersions.and.returnValues(Promise.resolve([article('first'), article('first', 'zh-TW'), article('first', 'en', 'draft')]), next.promise);
    component.ngOnInit();
    await settle();
    lang.next('zh-TW');
    expect(component.article?.lang).toBe('zh-TW');
    expect(seo.setArticle.calls.mostRecent().args[0]?.lang).toBe('zh-TW');
    params.next(convertToParamMap({ slug: 'next' }));
    expect(component.article).toBeNull();
    expect(component.html).toBe('');
    expect(seo.setArticlePending).toHaveBeenCalledWith('next');
    next.resolve([article('next', 'en', 'draft'), article('wrong-slug')]);
    await settle();
    expect(component.article).toBeNull();
  });

  it('keeps metadata empty on a failed request and ignores completions after destruction', async () => {
    const pending = deferred<Article[]>();
    articles.getPublishedVersions.and.returnValue(pending.promise);
    component.ngOnInit();
    component.ngOnDestroy();
    seo.setArticle.calls.reset();
    pending.resolve([article('first')]);
    await settle();
    expect(component.article).toBeNull();
    expect(seo.setArticle).not.toHaveBeenCalled();
    expect(seo.clearArticle).toHaveBeenCalled();
  });

  it('marks a current failure without retaining the previous article', async () => {
    articles.getPublishedVersions.and.returnValues(Promise.resolve([article('first')]), Promise.reject(new Error('Unavailable')));
    spyOn(console, 'error');
    component.ngOnInit();
    await settle();
    params.next(convertToParamMap({ slug: 'unavailable' }));
    await settle();
    expect(component.loadError).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.article).toBeNull();
    expect(seo.setArticle.calls.mostRecent().args[0]).toBeNull();
  });

  it('renders the prerendered article from the build without a request and writes it to the transfer state', () => {
    component = create({ projects: [], articles: [article('first'), article('other')] });
    component.ngOnInit();
    expect(articles.getPublishedVersions).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.article?.slug).toBe('first');
    expect(seo.setArticle.calls.mostRecent().args[0]?.slug).toBe('first');
    expect(state.get(articleState('first'), null)?.map(version => version.slug)).toEqual(['first']);
  });

  it('starts the browser from the prerendered article and keeps it when the refresh fails', async () => {
    state.set(articleState('first'), [article('first')]);
    articles.getPublishedVersions.and.returnValue(Promise.reject(new Error('Unavailable')));
    spyOn(console, 'error');
    component.ngOnInit();
    expect(component.isLoading).toBeFalse();
    const shown = component.article;
    expect(shown?.slug).toBe('first');
    await settle();
    expect(component.loadError).toBeFalse();
    expect(component.article).toBe(shown);
  });

  it('keeps the rendered article when the refresh returns the same version', async () => {
    state.set(articleState('first'), [article('first')]);
    articles.getPublishedVersions.and.returnValue(Promise.resolve([article('first')]));
    component.ngOnInit();
    const shown = component.article;
    await settle();
    expect(component.article).toBe(shown);
  });

  it('removes a prerendered article that is no longer published', async () => {
    state.set(articleState('first'), [article('first')]);
    articles.getPublishedVersions.and.returnValue(Promise.resolve([]));
    component.ngOnInit();
    await settle();
    expect(component.article).toBeNull();
    expect(seo.setArticle.calls.mostRecent().args[0]).toBeNull();
  });
});
