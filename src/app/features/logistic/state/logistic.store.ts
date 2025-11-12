import { computed, inject, Injectable, signal } from '@angular/core';
import { AppStore } from '../../../core/state/app.store';
import { Pagination } from '../../../shared/types/pagination';
import { Delivery } from '../../../shared/models/delivery.model';
import { Location } from '../../../shared/models/location.model';
import { LogisticService } from '../services/logistic.service';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { UsersService } from '../../users/services/users.service';
import { AppUser } from '../../../shared/models/user.model';
import { Warehouse } from '../../../shared/models/warehouse.model';

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
  private usersService = inject(UsersService);

  private _deliveries = signal<Delivery[]>([]);
  private _deliveriesPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _deliveryUsers = signal<AppUser[]>([]);
  private _deliveryUsersPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _warehouses = signal<Warehouse[]>([]);
  private _warehousesPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly deliveries = computed(() => this._deliveries());
  readonly deliveriesPagination = computed(() => this._deliveriesPagination());
  readonly deliveryUsers = computed(() => this._deliveryUsers());
  readonly deliveryUsersPagination = computed(() => this._deliveryUsersPagination());
  readonly warehouses = computed(() => this._warehouses());
  readonly warehousesPagination = computed(() => this._warehousesPagination());
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

  loadDeliveryUsers(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.appStore.setApiBusy(true);

    this.usersService.getDeliveryUsers().subscribe({
      next: (response) => this.handleDeliveryUsersResponse(response),
      error: (err) => this.handleDeliveryUsersError(err)
    });
  }
  
  loadWarehouses(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.appStore.setApiBusy(true);

    this.logisticService.getWarehouses().subscribe({
      next: (response) => this.handleWarehousesResponse(response),
      error: (err) => this.handleWarehousesError(err)
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

  updateDeliveryLocation(deliveryId: Delivery['id'], location: Location | null | undefined): void {
    this._deliveries.update((deliveries) =>
      deliveries.map((delivery) => (delivery.id === deliveryId ? { ...delivery, location: location ?? undefined } : delivery))
    );
  }

  private handleDeliveriesResponse(response: LogisticPaginationResponse): void {
    this._deliveries.set(response.items);
    this._deliveriesPagination.set(response.pagination ?? DEFAULT_PAGINATION);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleDeliveriesError(error: unknown): void {
    const message = this.extractErrorMessage(error, 'Error loading deliveries');

    this._error.set(message);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleDeliveryUsersResponse(response: PaginatedResponseDTO<AppUser>): void {
    this._deliveryUsers.set(response.items);
    this._deliveryUsersPagination.set(response.pagination ?? DEFAULT_PAGINATION);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleDeliveryUsersError(error: unknown): void {
    const message = this.extractErrorMessage(error, 'Error loading delivery users');

    this._error.set(message);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleWarehousesResponse(response: PaginatedResponseDTO<Warehouse>): void {
    this._warehouses.set(response.items);
    this._warehousesPagination.set(response.pagination ?? DEFAULT_PAGINATION);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleWarehousesError(error: unknown): void {
    const message = this.extractErrorMessage(error, 'Error loading warehouses');

    this._error.set(message);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private extractErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return defaultMessage;
  }
}

