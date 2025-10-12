import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppStore } from '../state/app.store';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const appStore = inject(AppStore);
  const router = inject(Router);
  
  const isLoggedIn = appStore.isLoggedIn();
  
  if (!isLoggedIn) {
    // Get the current locale from the URL
    const urlSegments = state.url.split('/');
    const locale = urlSegments[1] && ['en', 'es'].includes(urlSegments[1]) ? urlSegments[1] : 'en';
    
    // Redirect to login page with the current locale
    router.navigate([`/${locale}/login`]);
    return false;
  }
  
  return true;
};

