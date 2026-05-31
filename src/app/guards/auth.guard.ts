import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard:
CanActivateFn = () => {

  const router = inject(Router);

  const isAuth =
    localStorage.getItem(
      'isAuthenticated'
    );

  if (isAuth === 'true') {

    return true;
  }

  router.navigate(['/login']);

  return false;
};