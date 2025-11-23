import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { ICON_PROVIDER } from './core/init/icon-init';
import { TRANSLOCO_PROVIDER } from './core/init/transloco-init';
import { LOCALE_INITIALIZER } from './core/init/locale-initializer';
import { I18nTitleStrategy } from './core/services/i18n-title-strategy';
import { ChunkLoadingErrorHandler } from './core/services/chunk-loading-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    ICON_PROVIDER,
    TRANSLOCO_PROVIDER,
    LOCALE_INITIALIZER,
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    { provide: ErrorHandler, useClass: ChunkLoadingErrorHandler }
  ]
};
