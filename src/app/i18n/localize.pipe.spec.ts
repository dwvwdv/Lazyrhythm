import { I18nService } from './i18n.service';
import { Lang } from './translations';
import { LocalizePipe } from './localize.pipe';

describe('LocalizePipe', () => {
  let lang: Lang;
  let pipe: LocalizePipe;

  beforeEach(() => {
    lang = 'zh-TW';
    pipe = new LocalizePipe({ get lang() { return lang; } } as I18nService);
  });

  it('keeps links in the current language', () => {
    expect(pipe.transform('/about')).toBe('/about');
    expect(pipe.transform('/')).toBe('/');
    lang = 'en';
    expect(pipe.transform('/about')).toBe('/en/about');
    expect(pipe.transform('/')).toBe('/en');
  });

  it('localizes routerLink commands and reuses the result while nothing changes', () => {
    lang = 'en';
    const first = pipe.transform(['/articles', 'hello']);
    expect(first).toEqual(['/en/articles', 'hello']);
    expect(pipe.transform(['/articles', 'hello'])).toBe(first);
    expect(pipe.transform(['/articles', 'other'])).toEqual(['/en/articles', 'other']);
    lang = 'zh-TW';
    expect(pipe.transform(['/articles', 'other'])).toEqual(['/articles', 'other']);
  });
});
