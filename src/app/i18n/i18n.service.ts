import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, SUPPORTED_LANGS, TRANSLATIONS, TranslationKey } from './translations';

const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSubject = new BehaviorSubject<Lang>(this.initialLang());
  readonly lang$ = this.langSubject.asObservable();

  constructor() {
    this.applyDocumentLang(this.lang);

    // 使用者沒手動選過語系時，跟著瀏覽器語言變化。
    window.addEventListener('languagechange', () => {
      if (this.readStored() === null) {
        this.setLang(this.detectBrowserLang(), false);
      }
    });
  }

  get lang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang, persist = true): void {
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // 無法寫入 storage 時只影響本次瀏覽。
      }
    }

    this.applyDocumentLang(lang);
    this.langSubject.next(lang);
  }

  toggle(): void {
    this.setLang(this.lang === 'zh-TW' ? 'en' : 'zh-TW');
  }

  t(key: TranslationKey | string): string {
    const table = TRANSLATIONS[this.lang] as Record<string, string>;
    return table[key] ?? (TRANSLATIONS.en as Record<string, string>)[key] ?? key;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return new Intl.DateTimeFormat(this.lang, { year: 'numeric', month: 'short', day: 'numeric' })
      .format(new Date(value));
  }

  private initialLang(): Lang {
    return this.readStored() ?? this.detectBrowserLang();
  }

  private readStored(): Lang | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGS.includes(stored as Lang) ? stored as Lang : null;
    } catch {
      return null;
    }
  }

  private detectBrowserLang(): Lang {
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

    return 'en';
  }

  private applyDocumentLang(lang: Lang): void {
    document.documentElement.lang = lang;
  }
}
