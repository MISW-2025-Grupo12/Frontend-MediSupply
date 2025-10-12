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
      // Get the locale from the LocaleRouteService
      const locale = localeRouteService.getCurrentLocale();
      
      // Set the active language in Transloco if it's different
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

