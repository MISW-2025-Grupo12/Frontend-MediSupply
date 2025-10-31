import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppStore } from '../state/app.store';
import { UserType } from '../../shared/enums/user-type';

export const roleGuard = (allowedRoles: UserType[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const appStore = inject(AppStore);
    const router = inject(Router);
    
    const user = appStore.user();
    
    if (!user) {
      // User not logged in, redirect to login
      const urlSegments = state.url.split('/');
      const locale = urlSegments[1] && ['en', 'es'].includes(urlSegments[1]) ? urlSegments[1] : 'en';
      router.navigate([`/${locale}/login`]);
      return false;
    }
    
    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to dashboard
      const urlSegments = state.url.split('/');
      const locale = urlSegments[1] && ['en', 'es'].includes(urlSegments[1]) ? urlSegments[1] : 'en';
      const dashboardPath = locale === 'en' ? 'dashboard' : 'panel';
      router.navigate([`/${locale}/${dashboardPath}`]);
      return false;
    }
    
    return true;
  };
};

