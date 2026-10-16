import { I18nService } from './i18n.service';
import { TRANSLATIONS } from './translations';

describe('I18nService', () => {
  let languages: string[];

  beforeEach(() => {
    localStorage.removeItem('lang');
    languages = ['en-US'];
    spyOnProperty(navigator, 'languages', 'get').and.callFake(() => languages);
  });

  afterEach(() => localStorage.removeItem('lang'));

  it('defaults to Traditional Chinese when the browser prefers Chinese', () => {
    languages = ['zh-TW', 'en-US'];
    const service = new I18nService('browser', document);
    expect(service.lang).toBe('zh-TW');
    expect(document.documentElement.lang).toBe('zh-TW');
  });

  it('picks the first supported browser language', () => {
    languages = ['ja-JP', 'en-GB', 'zh-CN'];
    expect(new I18nService('browser', document).lang).toBe('en');
  });

  it('falls back to English for unsupported languages', () => {
    languages = ['fr-FR'];
    expect(new I18nService('browser', document).lang).toBe('en');
  });

  it('remembers a manual choice over the browser language', () => {
    languages = ['zh-TW'];
    const service = new I18nService('browser', document);
    service.toggle();
    expect(service.lang).toBe('en');
    expect(new I18nService('browser', document).lang).toBe('en');
  });

  it('translates keys for the active language', () => {
    languages = ['zh-TW'];
    const service = new I18nService('browser', document);
    expect(service.t('nav.about')).toBe('關於');
    service.setLang('en');
    expect(service.t('nav.about')).toBe('ABOUT');
  });

  it('has the same keys in every language', () => {
    expect(Object.keys(TRANSLATIONS['zh-TW']).sort()).toEqual(Object.keys(TRANSLATIONS.en).sort());
  });

  it('uses deterministic English and an isolated document during prerender', () => {
    languages = ['zh-TW'];
    const stored = spyOn(localStorage, 'getItem').and.callThrough();
    const persist = spyOn(localStorage, 'setItem').and.callThrough();
    const serverDocument = document.implementation.createHTMLDocument('Prerender');
    const service = new I18nService('server', serverDocument);

    expect(service.lang).toBe('en');
    expect(serverDocument.documentElement.lang).toBe('en');
    service.setLang('zh-TW');
    expect(serverDocument.documentElement.lang).toBe('zh-TW');
    expect(stored).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
});
