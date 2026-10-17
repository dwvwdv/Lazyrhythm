import { langFromPath, languageVersions, localizePath, stripLangPrefix } from './lang-path';

describe('lang-path', () => {
  it('serves 中文 at the root and English under /en only', () => {
    expect(langFromPath('/')).toBe('zh-TW');
    expect(langFromPath('/about?x=1')).toBe('zh-TW');
    expect(langFromPath('/en')).toBe('en');
    expect(langFromPath('/en?x=1')).toBe('en');
    expect(langFromPath('/en/articles/hello#top')).toBe('en');
    expect(langFromPath('/english')).toBe('zh-TW');
    expect(langFromPath('/articles/en')).toBe('zh-TW');
  });

  it('strips and adds the prefix while keeping query and hash', () => {
    expect(stripLangPrefix('/en/about?x=1#y')).toBe('/about?x=1#y');
    expect(stripLangPrefix('/en')).toBe('/');
    expect(stripLangPrefix('/about')).toBe('/about');
    expect(localizePath('/about?x=1', 'en')).toBe('/en/about?x=1');
    expect(localizePath('/', 'en')).toBe('/en');
    expect(localizePath('/?x=1', 'en')).toBe('/en?x=1');
    expect(localizePath('/en/about', 'zh-TW')).toBe('/about');
    expect(localizePath('/en', 'zh-TW')).toBe('/');
    expect(localizePath('/en/about', 'en')).toBe('/en/about');
  });

  it('lists every language version of a page', () => {
    expect(languageVersions('/en/works')).toEqual([{ lang: 'en', path: '/en/works' }, { lang: 'zh-TW', path: '/works' }]);
  });
});
