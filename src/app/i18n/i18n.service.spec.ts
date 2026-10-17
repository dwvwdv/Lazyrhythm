import { PlatformLocation } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { I18nService } from './i18n.service';
import { TRANSLATIONS } from './translations';

describe('I18nService', () => {
  let languages: string[];
  let events: Subject<unknown>;
  let router: { url: string; events: Subject<unknown>; navigateByUrl: jasmine.Spy };

  function create(pathname: string, platform = 'browser', doc: Document = document): I18nService {
    return new I18nService(platform, doc, { pathname } as PlatformLocation, router as unknown as Router);
  }

  beforeEach(() => {
    localStorage.removeItem('lang');
    languages = ['en-US'];
    spyOnProperty(navigator, 'languages', 'get').and.callFake(() => languages);
    events = new Subject();
    router = { url: '/', events, navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) };
  });

  afterEach(() => localStorage.removeItem('lang'));

  it('takes the language from the URL, not the browser', () => {
    languages = ['en-US'];
    const zh = create('/about');
    expect(zh.lang).toBe('zh-TW');
    expect(document.documentElement.lang).toBe('zh-TW');
    languages = ['zh-TW'];
    expect(create('/en/about').lang).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('follows navigation between language prefixes', () => {
    const service = create('/');
    events.next(new NavigationStart(1, '/en/works'));
    expect(service.lang).toBe('en');
    events.next(new NavigationStart(2, '/works'));
    expect(service.lang).toBe('zh-TW');
  });

  it('switches language by opening the same page in the other language and remembers it', () => {
    router.url = '/articles/hello?x=1';
    const service = create('/articles/hello');
    service.toggle();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/en/articles/hello?x=1');
    expect(localStorage.getItem('lang')).toBe('en');

    router.url = '/en';
    service.setLang('zh-TW');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('prefers a saved choice over the browser language for suggestions', () => {
    languages = ['fr-FR', 'zh-HK'];
    const service = create('/');
    expect(service.preferredLang()).toBe('zh-TW');
    languages = ['fr-FR'];
    expect(service.preferredLang()).toBeNull();
    localStorage.setItem('lang', 'en');
    expect(service.preferredLang()).toBe('en');
  });

  it('translates keys for the active or a requested language', () => {
    const service = create('/');
    expect(service.t('nav.about')).toBe('關於');
    expect(service.t('nav.about', 'en')).toBe('ABOUT');
    events.next(new NavigationStart(1, '/en'));
    expect(service.t('nav.about')).toBe('ABOUT');
  });

  it('has the same keys in every language', () => {
    expect(Object.keys(TRANSLATIONS['zh-TW']).sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
  });

  it('renders the URL language during prerender without touching browser storage', () => {
    const stored = spyOn(localStorage, 'getItem').and.callThrough();
    const serverDocument = document.implementation.createHTMLDocument('Prerender');
    const service = create('/en/about', 'server', serverDocument);

    expect(service.lang).toBe('en');
    expect(serverDocument.documentElement.lang).toBe('en');
    expect(service.preferredLang()).toBeNull();
    expect(stored).not.toHaveBeenCalled();
  });
});
