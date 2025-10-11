import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class LocaleRouteService {
  private router = inject(Router);
  private translocoService = inject(TranslocoService);

  private readonly SUPPORTED_LOCALES = ['en', 'es'];
  private readonly DEFAULT_LOCALE = 'en';

  /**
   * Get the current locale from the URL
   */
  getCurrentLocale(): string {
    const urlSegments = this.router.url.split('/');
    const locale = urlSegments[1];
    return this.SUPPORTED_LOCALES.includes(locale) ? locale : this.DEFAULT_LOCALE;
  }

  /**
   * Navigate to a route with the current locale
   */
  navigateToRoute(routeKey: string, params?: any): void {
    const locale = this.getCurrentLocale();
    
    // Direct mapping without translations
    const routeMap: Record<string, Record<string, string>> = {
      'en': {
        'products': 'products',
        'add': 'add',
        'clients': 'clients'
      },
      'es': {
        'products': 'productos',
        'add': 'anadir',
        'clients': 'clientes'
      }
    };
    
    const translatedPath = routeMap[locale]?.[routeKey] || routeKey;
    
    if (params) {
      this.router.navigate([`/${locale}/${translatedPath}`, params]);
    } else {
      this.router.navigate([`/${locale}/${translatedPath}`]);
    }
  }

  /**
   * Change the language and redirect to the same route
   */
  changeLanguage(newLocale: string): void {
    if (!this.SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    const currentLocale = this.getCurrentLocale();
    const currentUrl = this.router.url;
    
    // Parse the URL to get segments
    const pathSegments = currentUrl.split('/').filter(s => s && !s.includes('?') && !s.includes('#'));
    
    // Map of route translations
    const routeMap: Record<string, Record<string, string>> = {
      'en': {
        'products': 'products',
        'add': 'add',
        'clients': 'clients'
      },
      'es': {
        'productos': 'productos',
        'anadir': 'anadir',
        'clientes': 'clientes'
      }
    };
    
    // Reverse map for looking up keys
    const reverseMap: Record<string, string> = {
      'products': 'productos',
      'productos': 'products',
      'add': 'anadir',
      'anadir': 'add',
      'clients': 'clientes',
      'clientes': 'clients'
    };
    
    // Build new URL by translating each segment
    const newSegments = pathSegments.map((segment, index) => {
      // First segment is the locale
      if (index === 0) {
        return newLocale;
      }
      
      // Try to translate other segments
      if (reverseMap[segment]) {
        return newLocale === 'es' && currentLocale === 'en' ? reverseMap[segment] :
               newLocale === 'en' && currentLocale === 'es' ? reverseMap[segment] : segment;
      }
      
      return segment;
    });
    
    const finalUrl = '/' + newSegments.join('/');
    
    // Set the active language in Transloco
    this.translocoService.setActiveLang(newLocale);
    
    // Navigate to the new URL
    void this.router.navigateByUrl(finalUrl);
  }

  /**
   * Get the localized URL for a route
   */
  getLocalizedUrl(routeKey: string, locale?: string): string {
    const targetLocale = locale || this.getCurrentLocale();
    
    // Direct mapping without translations
    const routeMap: Record<string, Record<string, string>> = {
      'en': {
        'products': 'products',
        'add': 'add',
        'clients': 'clients'
      },
      'es': {
        'products': 'productos',
        'add': 'anadir',
        'clients': 'clientes'
      }
    };
    
    const translatedPath = routeMap[targetLocale]?.[routeKey] || routeKey;
    return `/${targetLocale}/${translatedPath}`;
  }
}

