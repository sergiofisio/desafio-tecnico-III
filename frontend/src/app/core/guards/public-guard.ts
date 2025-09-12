import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../auth/services/auth';
import { inject } from '@angular/core';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/patients']);
    return false;
  }

  return true;
};
