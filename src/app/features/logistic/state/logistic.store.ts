import { computed, inject, Injectable, signal } from '@angular/core';
import { AppStore } from '../../../core/state/app.store';
import { Pagination } from '../../../shared/types/pagination';
import { Delivery } from '../../../shared/models/delivery.model';
import { LogisticService } from '../services/logistic.service';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';

type LogisticPaginationResponse = PaginatedResponseDTO<Delivery>;

const DEFAULT_PAGINATION: Pagination = {
  has_next: false,
  has_prev: false,
  page: 1,
  page_size: 0,
  total_items: 0,
  total_pages: 0
};

@Injectable({ providedIn: 'root' })
export class LogisticStore {
  private appStore = inject(AppStore);
  private logisticService = inject(LogisticService);

  private _deliveries = signal<Delivery[]>([]);
  private _pagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly deliveries = computed(() => this._deliveries());
  readonly pagination = computed(() => this._pagination());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  loadDeliveries(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.appStore.setApiBusy(true);

    this.logisticService.getDeliveries().subscribe({
      next: (response) => this.handleDeliveriesResponse(response),
      error: (err) => this.handleDeliveriesError(err)
    });
  }

  loadMockDeliveries(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.logisticService.getMockDeliveries().subscribe({
      next: (response) => this.handleDeliveriesResponse(response),
      error: (err) => this.handleDeliveriesError(err)
    });
  }

  private handleDeliveriesResponse(response: LogisticPaginationResponse): void {
    this._deliveries.set(response.items);
    this._pagination.set(response.pagination ?? DEFAULT_PAGINATION);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleDeliveriesError(error: unknown): void {
    const message = this.extractErrorMessage(error);

    this._error.set(message);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Error loading deliveries';
  }
}

