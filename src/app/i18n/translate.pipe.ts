import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { TranslationKey } from './translations';

// impure：切換語系時不需重建元件即可重新取字。
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: TranslationKey | string): string {
    return this.i18n.t(key);
  }
}
