import { DOCUMENT, isPlatformBrowser, PlatformLocation } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { langFromPath, localizePath } from './lang-path';
import { Lang, SUPPORTED_LANGS, TRANSLATIONS, TranslationKey } from './translations';

const STORAGE_KEY = 'lang';

/**
 * The URL decides the language (中文 at the root, English under /en), so the server and the
 * browser render the same text and every language has its own indexable URL.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSubject = new BehaviorSubject<Lang>(langFromPath(this.location.pathname));
  readonly lang$ = this.langSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: string,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly location: PlatformLocation,
    private readonly router: Router
  ) {
    this.applyDocumentLang(this.lang);
    // Switch before the next page renders so it never shows the previous language.
    this.router.events.pipe(filter(event => event instanceof NavigationStart))
      .subscribe(event => this.apply(langFromPath(event.url)));
  }

  get lang(): Lang {
    return this.langSubject.value;
  }

  /** Opens the current page in another language and remembers the choice for suggestions. */
  setLang(lang: Lang): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // 無法寫入 storage 時只影響本次瀏覽。
      }
    }
    return this.router.navigateByUrl(localizePath(this.router.url, lang));
  }

  toggle(): Promise<boolean> {
    return this.setLang(this.lang === 'zh-TW' ? 'en' : 'zh-TW');
  }

  /** The language a visitor likely wants: their last manual choice, else the browser's. */
  preferredLang(): Lang | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.readStored() ?? this.detectBrowserLang();
  }

  t(key: TranslationKey | string, lang: Lang = this.lang): string {
    const table = TRANSLATIONS[lang] as Record<string, string>;
    return table[key] ?? (TRANSLATIONS.en as Record<string, string>)[key] ?? key;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return new Intl.DateTimeFormat(this.lang, { year: 'numeric', month: 'short', day: 'numeric' })
      .format(new Date(value));
  }

  private apply(lang: Lang): void {
    if (lang === this.lang) return;
    this.applyDocumentLang(lang);
    this.langSubject.next(lang);
  }

  private readStored(): Lang | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGS.includes(stored as Lang) ? stored as Lang : null;
    } catch {
      return null;
    }
  }

  private detectBrowserLang(): Lang | null {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

    for (const candidate of candidates) {
      const lower = (candidate ?? '').toLowerCase();
      if (lower.startsWith('zh')) {
        return 'zh-TW';
      }
      if (lower.startsWith('en')) {
        return 'en';
      }
    }

    return null;
  }

  private applyDocumentLang(lang: Lang): void {
    this.document.documentElement.lang = lang;
  }
}
