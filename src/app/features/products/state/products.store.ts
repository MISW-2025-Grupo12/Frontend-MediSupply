import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore } from '../../../core/state/app.store';
import { LocaleRouteService } from '../../../core/services/locale-route.service';
import { Product } from '../../../shared/models/product.model';
import { ProductsService } from '../services/products.service';

@Injectable({ providedIn: 'root' })
export class ProductsState {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);
  private productsService = inject(ProductsService);
  
  private _products = signal<Product[]>([]);

  readonly products = computed(() => this._products());

  loadProducts(): void {
    this.productsService.getProducts().subscribe(products => {
      this._products.set(products);
    });
  }
}
