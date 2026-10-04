import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** 未登入時導回文章管理頁（該頁會顯示登入表單）。作者權限最終由 RLS 把關。 */
export const authorGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return (await auth.getAccessToken()) ? true : router.createUrlTree(['/articles/manage']);
};
