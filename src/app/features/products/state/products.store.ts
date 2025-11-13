import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ProductWithLocation } from '../../../shared/models/productWithLocation.model';
import { PaginationRequestDTO } from '../../../shared/DTOs/paginationRequestDTO.model';
import { ProductsService } from '../services/products.service';

@Injectable({ providedIn: 'root' })
export class ProductsState {
  private productsService = inject(ProductsService);
  
  private readonly pageSize = 3;

  private _products = signal<ProductWithLocation[]>([]);
  private _isLoading = signal(false);
  private _hasNext = signal(true);
  private _currentPage = signal(0);

  readonly products = computed(() => this._products());
  readonly isLoading = computed(() => this._isLoading());
  readonly hasMore = computed(() => this._hasNext());

  loadInitialProducts(): void {
    this.resetState();
    this.loadNextPage();
  }

  loadNextPage(): void {
    if (this._isLoading() || !this._hasNext()) {
      return;
    }

    const nextPage = this._currentPage() + 1;
    const paginationRequest: PaginationRequestDTO = {
      page: nextPage,
      page_size: this.pageSize
    };

    this.fetchProducts(paginationRequest, nextPage === 1);
  }

  private fetchProducts(pagination: PaginationRequestDTO, replace: boolean): void {
    this._isLoading.set(true);

    this.productsService
      .getProductsWithLocation(pagination)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: response => {
          this._currentPage.set(pagination.page);
          this._hasNext.set(response.pagination.has_next);
          this._products.update(products =>
            replace ? response.items : [...products, ...response.items]
          );
        }
      });
  }

  private resetState(): void {
    this._products.set([]);
    this._isLoading.set(false);
    this._hasNext.set(true);
    this._currentPage.set(0);
  }
}
