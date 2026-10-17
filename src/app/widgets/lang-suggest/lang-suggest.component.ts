import { Component, afterNextRender, signal } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { Lang } from '../../i18n/translations';

const DISMISSED_KEY = 'langSuggestDismissed';

/**
 * Offers the other language when the visitor's saved choice or browser language differs from the
 * page. It never redirects, so crawlers and shared links always get the language in the URL.
 */
@Component({
  selector: 'app-lang-suggest',
  templateUrl: './lang-suggest.component.html',
  styleUrls: ['./lang-suggest.component.scss']
})
export class LangSuggestComponent {
  /** The language to offer; null hides the card. Only set in the browser, after hydration. */
  readonly suggestion = signal<Lang | null>(null);

  constructor(readonly i18n: I18nService) {
    afterNextRender(() => this.i18n.lang$.subscribe(() => this.suggestion.set(this.pick())));
  }

  /** Text is shown in the offered language, since that is the one the visitor reads. */
  text(key: string): string {
    return this.i18n.t(key, this.suggestion() ?? this.i18n.lang);
  }

  switchLanguage(): void {
    const lang = this.suggestion();
    this.suggestion.set(null);
    if (lang) this.i18n.setLang(lang);
  }

  dismiss(): void {
    this.suggestion.set(null);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Without storage the card simply returns on the next visit.
    }
  }

  private pick(): Lang | null {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return null;
    } catch {
      // Storage may be blocked; still offer the language.
    }
    const preferred = this.i18n.preferredLang();
    return preferred && preferred !== this.i18n.lang ? preferred : null;
  }
}
