import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { LocaleRouteService } from '../../services/locale-route.service';
import { filter } from 'rxjs/operators';

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

  ngOnInit(): void {
    // Sync language with URL on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const locale = this.localeRouteService.getCurrentLocale();
        if (locale && locale !== this.translocoService.getActiveLang()) {
          this.translocoService.setActiveLang(locale);
        }
      });
    
    // Also sync on initial load
    const locale = this.localeRouteService.getCurrentLocale();
    if (locale && locale !== this.translocoService.getActiveLang()) {
      this.translocoService.setActiveLang(locale);
    }
  }

  get currentLang(): string {
    return this.translocoService.getActiveLang();
  }

  switchLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'es' : 'en';
    this.localeRouteService.changeLanguage(newLang);
  }

  getProductsRoute(): string {
    return this.localeRouteService.getLocalizedUrl('products');
  }

  getClientsRoute(): string {
    return this.localeRouteService.getLocalizedUrl('clients');
  }
}
