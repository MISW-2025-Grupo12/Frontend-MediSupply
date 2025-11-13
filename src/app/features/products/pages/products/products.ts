import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ProductsState } from '../../state/products.store';
import { ProductListComponent } from '../../ui/product-list.component/product-list.component';

@Component({
  selector: 'app-products',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslocoDirective, ProductListComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  private localeRouteService = inject(LocaleRouteService);
  
  productsStore = inject(ProductsState);

  ngOnInit(): void {
    this.productsStore.loadInitialProducts();
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
