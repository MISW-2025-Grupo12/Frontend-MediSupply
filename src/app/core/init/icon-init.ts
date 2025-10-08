import { provideAppInitializer, inject } from '@angular/core';
import { IconService } from '../services/icon-service';

export const ICON_PROVIDER = provideAppInitializer(() => {
  const iconService = inject(IconService);
  iconService.registerIcons();
});
