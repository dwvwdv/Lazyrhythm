import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { Lang, TRANSLATIONS } from '../../i18n/translations';
import { LangSuggestComponent } from './lang-suggest.component';

describe('LangSuggestComponent', () => {
  let lang: BehaviorSubject<Lang>;
  let preferred: Lang | null;
  let setLang: jasmine.Spy;
  let fixture: ComponentFixture<LangSuggestComponent>;

  function render(): HTMLElement {
    fixture = TestBed.createComponent(LangSuggestComponent);
    fixture.detectChanges();
    // The card is decided after the first render (never during hydration), so it shows on the next pass.
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    localStorage.removeItem('langSuggestDismissed');
    lang = new BehaviorSubject<Lang>('zh-TW');
    preferred = 'en';
    setLang = jasmine.createSpy('setLang').and.resolveTo(true);
    const i18n = {
      lang$: lang.asObservable(),
      get lang() { return lang.value; },
      preferredLang: () => preferred,
      t: (key: string, target: Lang = lang.value) => (TRANSLATIONS[target] as Record<string, string>)[key],
      setLang
    };
    TestBed.configureTestingModule({ imports: [LangSuggestComponent], providers: [{ provide: I18nService, useValue: i18n }] });
  });
  afterEach(() => localStorage.removeItem('langSuggestDismissed'));

  it('offers the preferred language in that language, and switches on request', () => {
    const element = render();
    const card = element.querySelector('.lang-suggest')!;
    expect(card.getAttribute('lang')).toBe('en');
    expect(card.textContent).toContain('This page is also available in English.');
    (element.querySelector('.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(setLang).toHaveBeenCalledWith('en');
    expect(element.querySelector('.lang-suggest')).toBeNull();
  });

  it('stays hidden when the page is already in the preferred language or no preference is known', () => {
    preferred = 'zh-TW';
    expect(render().querySelector('.lang-suggest')).toBeNull();
    preferred = null;
    expect(render().querySelector('.lang-suggest')).toBeNull();
  });

  it('remembers a dismissal', () => {
    const element = render();
    (element.querySelector('.dismiss') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.lang-suggest')).toBeNull();
    expect(render().querySelector('.lang-suggest')).toBeNull();
  });
});
