import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { AppStore } from '../state/app.store';

type SupportedLocale = 'en' | 'es';
type RouteKey = 'dashboard' | 'products' | 'sales' | 'salesReport' | 'add' | 'clients' | 'login' | 'orders' | 'users' | 'addUser' | 'register';

@Injectable({
  providedIn: 'root'
})
export class LocaleRouteService {
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  private appStore = inject(AppStore);

  private readonly SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es'];
  private readonly DEFAULT_LOCALE: SupportedLocale = 'es';

  /**
   * Centralized route mapping configuration
   */
  private readonly ROUTE_MAP: Record<SupportedLocale, Record<RouteKey, string>> = {
    'en': {
      'dashboard': 'dashboard',
      'products': 'products',
      'sales': 'sales',
      'salesReport': 'sales-report',
      'add': 'add',
      'clients': 'clients',
      'login': 'login',
      'orders': 'orders',
      'users': 'users',
      'addUser': 'add-user',
      'register': 'register'
    },
    'es': {
      'dashboard': 'panel',
      'products': 'productos',
      'sales': 'ventas',
      'salesReport': 'reportes-de-ventas',
      'add': 'anadir',
      'clients': 'clientes',
      'login': 'login',
      'orders': 'pedidos',
      'users': 'usuarios',
      'addUser': 'anadir-usuario',
      'register': 'registrarse'
    }
  };

  /**
   * Reverse mapping cache for efficient lookups
   */
  private readonly REVERSE_ROUTE_MAP: Record<string, RouteKey> = this.createReverseMap();

  /**
   * Creates a reverse mapping from localized routes to route keys
   */
  private createReverseMap(): Record<string, RouteKey> {
    const reverseMap: Record<string, RouteKey> = {};
    
    for (const locale of this.SUPPORTED_LOCALES) {
      for (const [routeKey, localizedRoute] of Object.entries(this.ROUTE_MAP[locale])) {
        reverseMap[localizedRoute] = routeKey as RouteKey;
      }
    }
    
    return reverseMap;
  }

  /**
   * Gets the localized route for a given route key and locale
   */
  private getLocalizedRoute(routeKey: RouteKey, locale: SupportedLocale): string {
    return this.ROUTE_MAP[locale]?.[routeKey] || routeKey;
  }

  /**
   * Finds the route key from a localized route path
   */
  private findRouteKey(localizedRoute: string): RouteKey | undefined {
    return this.REVERSE_ROUTE_MAP[localizedRoute];
  }

  /**
   * Validates if a locale is supported
   */
  private isValidLocale(locale: string): locale is SupportedLocale {
    return this.SUPPORTED_LOCALES.includes(locale as SupportedLocale);
  }

  /**
   * Get the current locale from the URL
   */
  getCurrentLocale(): SupportedLocale {
    // During APP_INITIALIZER, router.url might not be ready yet
    // Use window.location.pathname as fallback
    let url = this.router.url;
    if (!url || url === '/' || url === '') {
      url = window.location.pathname;
    }
    
    const urlSegments = url.split('/').filter(s => s);
    const locale = urlSegments[0];
    const detectedLocale = this.isValidLocale(locale) ? locale : this.DEFAULT_LOCALE;
    
    // Sync with AppStore if different
    if (this.appStore.locale() !== detectedLocale) {
      this.appStore.setLocale(detectedLocale);
    }
    
    return detectedLocale;
  }

  /**
   * Navigate to a route with the current locale
   */
  navigateToRoute(routeKey: string, params?: any): void {
    const locale = this.getCurrentLocale();
    
    // Check if it's a known route key, otherwise use as-is
    const isKnownRoute = routeKey in this.ROUTE_MAP[locale];
    const translatedPath = isKnownRoute 
      ? this.getLocalizedRoute(routeKey as RouteKey, locale)
      : routeKey;
    
    const routeSegments = [`/${locale}/${translatedPath}`];
    if (params) {
      routeSegments.push(params);
    }
    
    this.router.navigate(routeSegments);
  }

  /**
   * Navigate to nested routes with automatic path building
   * @example navigateToNestedRoute(['products', 'add'])
   * @example navigateToNestedRoute(['sales', 'salesReport'])
   */
  navigateToNestedRoute(routeKeys: string[], params?: any, queryParams?: any): void {
    const locale = this.getCurrentLocale();
    
    // Build the complete localized path
    const pathSegments: string[] = [locale];
    
    for (const routeKey of routeKeys) {
      const isKnownRoute = routeKey in this.ROUTE_MAP[locale];
      const translatedSegment = isKnownRoute 
        ? this.getLocalizedRoute(routeKey as RouteKey, locale)
        : routeKey;
      pathSegments.push(translatedSegment);
    }
    
    const navigationExtras: any = {};
    if (queryParams) {
      navigationExtras.queryParams = queryParams;
    }
    
    if (params) {
      this.router.navigate([`/${pathSegments.join('/')}`, params], navigationExtras);
    } else {
      this.router.navigate([`/${pathSegments.join('/')}`], navigationExtras);
    }
  }

  /**
   * Navigate with route parameters
   * @example navigateWithParams('products', { id: '123' })
   */
  navigateWithParams(routeKey: string, params: Record<string, any>, queryParams?: any): void {
    const locale = this.getCurrentLocale();
    const isKnownRoute = routeKey in this.ROUTE_MAP[locale];
    const translatedPath = isKnownRoute 
      ? this.getLocalizedRoute(routeKey as RouteKey, locale)
      : routeKey;
    
    const navigationExtras: any = {};
    if (queryParams) {
      navigationExtras.queryParams = queryParams;
    }
    
    this.router.navigate([`/${locale}/${translatedPath}`, params], navigationExtras);
  }

  /**
   * Change the language and redirect to the same route
   */
  changeLanguage(newLocale: string): void {
    if (!this.isValidLocale(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    // Update the AppStore
    this.appStore.setLocale(newLocale);

    const currentUrl = this.router.url;
    
    // Parse the URL to get segments
    const pathSegments = currentUrl.split('/').filter(s => s && !s.includes('?') && !s.includes('#'));
    
    // Build new URL by translating each segment
    const newSegments = pathSegments.map((segment, index) => {
      // First segment is the locale
      if (index === 0) {
        return newLocale;
      }
      
      // Try to find route key and translate to new locale
      const routeKey = this.findRouteKey(segment);
      if (routeKey) {
        return this.getLocalizedRoute(routeKey, newLocale);
      }
      
      // Keep segment as-is if no translation found
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
  getLocalizedUrl(routeKey: RouteKey, locale?: SupportedLocale): string {
    const targetLocale = locale || this.getCurrentLocale();
    
    // Check if it's a known route key, otherwise use as-is
    const isKnownRoute = routeKey in this.ROUTE_MAP[targetLocale];
    const translatedPath = isKnownRoute 
      ? this.getLocalizedRoute(routeKey, targetLocale)
      : routeKey;
    
    return `/${targetLocale}/${translatedPath}`;
  }
}

