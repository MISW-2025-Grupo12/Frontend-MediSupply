import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppStore } from '../state/app.store';

/**
 * Guest guard - prevents authenticated users from accessing login/register pages
 * Redirects logged-in users to dashboard
 */
export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const appStore = inject(AppStore);
  const router = inject(Router);
  
  const isLoggedIn = appStore.isLoggedIn();
  
  if (isLoggedIn) {
    // Get the current locale from the URL
    const urlSegments = state.url.split('/');
    const locale = urlSegments[1] && ['en', 'es'].includes(urlSegments[1]) ? urlSegments[1] : 'en';
    
    // Redirect to dashboard - already logged in
    const dashboardPath = locale === 'es' ? 'panel' : 'dashboard';
    router.navigate([`/${locale}/${dashboardPath}`]);
    return false;
  }
  
  return true;
};

