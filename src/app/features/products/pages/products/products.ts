import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective } from '@ngneat/transloco';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ProductsState } from '../../state/products.store';
import { ProductListComponent } from '../../ui/product-list.component/product-list.component';

@Component({
  selector: 'app-products',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslocoDirective, ProductListComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit, OnDestroy {
  private localeRouteService = inject(LocaleRouteService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  productsStore = inject(ProductsState);

  ngOnInit(): void {
    // Load products when component is initialized
    this.productsStore.loadInitialProducts();

    // Subscribe to router events to refresh products when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => {
          // Only refresh when we're on the base products route (not a child route)
          const url = event.urlAfterRedirects;
          return /^\/(en|es)\/(products|productos)(\?|$)/.test(url);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Refresh products every time we navigate to this route
        this.productsStore.loadInitialProducts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToAddProduct(): void {
    // Use the enhanced API for nested route navigation
    this.localeRouteService.navigateToNestedRoute(['products', 'add']);
  }

  navigateToAddCategory(): void {
    this.localeRouteService.navigateToNestedRoute(['products', 'add-category']);
  }

  navigateToLoadProducts(): void {
    this.localeRouteService.navigateToNestedRoute(['products', 'load-products']);
  }
}
