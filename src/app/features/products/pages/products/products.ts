import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ProductsState } from '../../state/products.store';
import { ProductListComponent } from '../../ui/product-list.component/product-list.component';

@Component({
  selector: 'app-products',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, ProductListComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  private localeRouteService = inject(LocaleRouteService);
  
  productsStore = inject(ProductsState);

  ngOnInit(): void {
    this.productsStore.loadProducts();
  }

  navigateToAddProduct(): void {
    // Use the enhanced API for nested route navigation
    this.localeRouteService.navigateToNestedRoute(['products', 'add']);
  }

  navigateToAddCategory(): void {
    this.localeRouteService.navigateToNestedRoute(['products', 'add-category']);
  }
}
