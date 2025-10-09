import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ICON_PROVIDER } from './core/init/icon-init';
import { TRANSLOCO_PROVIDER } from './core/init/transloco-init';
import { LOCALE_INITIALIZER } from './core/init/locale-initializer';
import { I18nTitleStrategy } from './core/services/i18n-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    ICON_PROVIDER,
    TRANSLOCO_PROVIDER,
    LOCALE_INITIALIZER,
    { provide: TitleStrategy, useClass: I18nTitleStrategy }
  ]
};
