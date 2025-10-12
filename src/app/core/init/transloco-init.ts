import { isDevMode, Provider } from '@angular/core';
import { provideTransloco } from '@ngneat/transloco';
import { TranslocoHttpLoader } from '../services/transloco-loader';

export const TRANSLOCO_PROVIDER: Provider[] = [
  provideTransloco({
    config: {
      availableLangs: ['en', 'es'],
      defaultLang: 'es',
      fallbackLang: 'es',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
      missingHandler: {
        useFallbackTranslation: true,
        logMissingKey: !isDevMode()
      }
    },
    loader: TranslocoHttpLoader
  })
];

