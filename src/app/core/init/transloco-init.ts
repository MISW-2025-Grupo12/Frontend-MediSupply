import { isDevMode, Provider } from '@angular/core';
import { provideTransloco } from '@ngneat/transloco';
import { TranslocoHttpLoader } from '../services/transloco-loader';

export const TRANSLOCO_PROVIDER: Provider[] = [
  provideTransloco({
    config: {
      availableLangs: ['en', 'es'],
      defaultLang: 'en',
      // Remove this option if your application doesn't support changing language in runtime.
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader
  })
];

