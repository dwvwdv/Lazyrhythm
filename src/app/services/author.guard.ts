import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { I18nService } from '../i18n/i18n.service';
import { localizePath } from '../i18n/lang-path';

/** 未登入時導回文章管理頁（該頁會顯示登入表單）。作者權限最終由 RLS 把關。 */
export const authorGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const i18n = inject(I18nService);

  return (await auth.getAccessToken()) ? true : router.parseUrl(localizePath('/articles/manage', i18n.lang));
};
