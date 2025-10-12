import { APP_INITIALIZER, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { LocaleRouteService } from '../services/locale-route.service';

/**
 * Initialize the active language based on the current URL
 */
export function initializeLocale(
  router: Router,
  translocoService: TranslocoService,
  localeRouteService: LocaleRouteService
): () => Promise<void> {
  return () => {
    return new Promise((resolve) => {
      // Set locale immediately based on URL
      const url = window.location.pathname;
      const urlSegments = url.split('/').filter(s => s);
      const locale = urlSegments[0] && ['en', 'es'].includes(urlSegments[0]) ? urlSegments[0] : 'es';
      
      // Set the locale in AppStore
      localeRouteService.getCurrentLocale(); // This updates AppStore
      
      // Set the active language in Transloco immediately
      if (locale !== translocoService.getActiveLang()) {
        translocoService.setActiveLang(locale);
      }
      
      resolve();
    });
  };
}

export const LOCALE_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeLocale,
  deps: [Router, TranslocoService, LocaleRouteService],
  multi: true
};

