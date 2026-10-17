import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { localizePath } from './lang-path';

/**
 * Keeps router links in the current language: '/about' | localize -> '/en/about' on English pages.
 * Accepts a path or routerLink commands whose first item is an absolute path.
 * Impure like the t pipe, so links follow a language change without rebuilding components.
 */
@Pipe({ name: 'localize', pure: false })
export class LocalizePipe implements PipeTransform {
  // Returning the previous array while nothing changed keeps routerLink from recomputing every cycle.
  private last?: { lang: string; input: unknown[]; output: unknown[] };

  constructor(private i18n: I18nService) {}

  transform(link: string): string;
  transform(link: unknown[]): unknown[];
  transform(link: string | unknown[]): string | unknown[] {
    const lang = this.i18n.lang;
    if (typeof link === 'string') return localizePath(link, lang);
    const last = this.last;
    if (last && last.lang === lang && last.input.length === link.length && last.input.every((item, i) => item === link[i])) {
      return last.output;
    }
    const [first, ...rest] = link;
    const output = [localizePath(String(first), lang), ...rest];
    this.last = { lang, input: [...link], output };
    return output;
  }
}
