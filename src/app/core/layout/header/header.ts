import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { LocaleRouteService } from '../../services/locale-route.service';
import { AppStore } from '../../state/app.store';
import { filter } from 'rxjs/operators';
import { UserType } from '../../../shared/enums/user-type';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatIcon, TranslocoDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  public localeRouteService = inject(LocaleRouteService);
  public appStore = inject(AppStore);

  ngOnInit(): void {
    // Sync language with URL on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const locale = this.localeRouteService.getCurrentLocale();
        // Update AppStore locale
        this.localeRouteService.getCurrentLocale(); // This updates AppStore
        
        if (locale && locale !== this.translocoService.getActiveLang()) {
          this.translocoService.setActiveLang(locale);
        }
      });
    
    // Also sync on initial load
    const locale = this.localeRouteService.getCurrentLocale();
    // Update AppStore locale
    this.localeRouteService.getCurrentLocale(); // This updates AppStore
    
    if (locale && locale !== this.translocoService.getActiveLang()) {
      this.translocoService.setActiveLang(locale);
    }
  }

  get currentLang(): string {
    // Now we can use AppStore for locale information
    return this.appStore.locale();
  }

  switchLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'es' : 'en';
    this.localeRouteService.changeLanguage(newLang);
  }

  getDashboardRoute(): string {
    return this.localeRouteService.getLocalizedUrl('dashboard');
  }

  getProductsRoute(): string {
    return this.localeRouteService.getLocalizedUrl('products');
  }

  getLogisticRoute(): string {
    return this.localeRouteService.getLocalizedUrl('logistic');
  }

  getClientsRoute(): string {
    return this.localeRouteService.getLocalizedUrl('clients');
  }

  getSalesRoute(): string {
    return this.localeRouteService.getLocalizedUrl('sales');
  }

  getUsersRoute(): string {
    return this.localeRouteService.getLocalizedUrl('users');
  }

  private getUserRole(): UserType | null {
    const user = this.appStore.user();
    return user?.role ?? null;
  }

  canAccessProducts(): boolean {
    const role = this.getUserRole();
    return !!role && [UserType.ADMIN, UserType.PROVIDER].includes(role);
  }

  canAccessLogistic(): boolean {
    const role = this.getUserRole();
    return !!role && [UserType.ADMIN, UserType.DELIVERY].includes(role);
  }

  canAccessSales(): boolean {
    const role = this.getUserRole();
    return !!role && [UserType.SELLER, UserType.ADMIN].includes(role);
  }
}
