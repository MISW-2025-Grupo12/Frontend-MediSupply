import { computed, inject, Injectable, signal } from '@angular/core';
import { AppStore } from '../../../core/state/app.store';
import { Pagination } from '../../../shared/types/pagination';
import { Delivery } from '../../../shared/models/delivery.model';
import { Location } from '../../../shared/models/location.model';
import { LogisticService } from '../services/logistic.service';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { Warehouse } from '../../../shared/models/warehouse.model';
import { Route } from '../../../shared/models/route.model';

type LogisticPaginationResponse = PaginatedResponseDTO<Delivery>;
type LogisticRoutesResponse = PaginatedResponseDTO<Route>;

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
  private _deliveriesPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _warehouses = signal<Warehouse[]>([]);
  private _warehousesPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _routesLoading = signal<boolean>(false);
  private _routes = signal<Route[]>([]);
  private _routesPagination = signal<Pagination>(DEFAULT_PAGINATION);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly deliveries = computed(() => this._deliveries());
  readonly deliveriesPagination = computed(() => this._deliveriesPagination());
  readonly warehouses = computed(() => this._warehouses());
  readonly warehousesPagination = computed(() => this._warehousesPagination());
  readonly routesLoading = computed(() => this._routesLoading());
  readonly routes = computed(() => this._routes());
  readonly routesPagination = computed(() => this._routesPagination());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  loadUnassignedDeliveries(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.appStore.setApiBusy(true);

    this.logisticService.getDeliveries({ con_ruta: false }).subscribe({
      next: (response) => this.handleDeliveriesResponse(response),
      error: (err) => this.handleDeliveriesError(err)
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

  loadRoutes(filters?: {
    page?: number;
    pageSize?: number;
    date?: string;
    driverId?: string | number;
    warehouseId?: string | number;
  }): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.appStore.setApiBusy(true);
    this._routesLoading.set(true);

    this.logisticService.getRoutes(filters).subscribe({
      next: (response) => this.handleRoutesResponse(response),
      error: (err) => this.handleRoutesError(err)
    });
  }

  updateDeliveryLocation(deliveryId: Delivery['id'], location: Location | null | undefined): void {
    this._deliveries.update((deliveries) =>
      deliveries.map((delivery) => (delivery.id === deliveryId ? { ...delivery, location: location ?? undefined } : delivery))
    );
  }

  updateWarehouseLocation(warehouseId: Warehouse['id'], location: Location | null | undefined): void {
    this._warehouses.update((warehouses) =>
      warehouses.map((warehouse) =>
        warehouse.id === warehouseId ? { ...warehouse, location: location ?? undefined } : warehouse
      )
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

  private handleRoutesResponse(response: LogisticRoutesResponse): void {
    this._routes.set(response.items);
    this._routesPagination.set(response.pagination ?? DEFAULT_PAGINATION);
    this._routesLoading.set(false);
    this._isLoading.set(false);
    this.appStore.setApiBusy(false);
  }

  private handleRoutesError(error: unknown): void {
    const message = this.extractErrorMessage(error, 'Error loading routes');

    this._error.set(message);
    this._routesLoading.set(false);
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

