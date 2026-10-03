import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait if loading session
  if (authService.loading()) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!authService.loading()) {
          clearInterval(interval);
          resolve(true);
        }
      }, 50);
    });
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.loading()) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!authService.loading()) {
            clearInterval(interval);
            resolve(true);
          }
        }, 50);
      });
    }

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const userRole = authService.role();
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to their default dashboard if forbidden
    if (userRole) {
      switch (userRole) {
        case 'admin':
          return router.createUrlTree(['/admin']);
        case 'comercio':
          return router.createUrlTree(['/comercio']);
        case 'cliente':
        default:
          return router.createUrlTree(['/cliente']);
      }
    }

    return router.createUrlTree(['/auth/login']);
  };
};
