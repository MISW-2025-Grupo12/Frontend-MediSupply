import { Component, DestroyRef, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';
import { Delivery } from '../../../../shared/models/delivery.model';
import { Warehouse } from '../../../../shared/models/warehouse.model';
import { Location } from '../../../../shared/models/location.model';
import { CreateRoute } from '../../../../shared/models/createRoute.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Maps } from '../../../../shared/components/maps/maps';
import { RouteComputationService } from '../../../../core/services/route-computation.service';
import { GoogleMapsLoaderService } from '../../../../core/services/google-maps-loader.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from '../../../../../environments/environment';
import { SelectedDeliveries } from '../../ui/selected-deliveries/selected-deliveries';
import { UsersService } from '../../../users/services/users.service';
import { AppUser } from '../../../../shared/models/user.model';
import { LogisticService } from '../../services/logistic.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type RouteOriginMarker = {
  id: Warehouse['id'];
  label: string;
  position: google.maps.LatLngLiteral;
};

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslocoDirective,
    UnassignedDeliveries,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    SelectedDeliveries,
    MatSelectModule,
    Maps
  ],
  templateUrl: './add-route.html',
  styleUrl: './add-route.scss'
})
export class AddRoute implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly logisticStore = inject(LogisticStore);
  private readonly routeComputation = inject(RouteComputationService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly usersService = inject(UsersService);
  private readonly logisticService = inject(LogisticService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly googleMapsApiKey = environment.googleMapsApiKey;

  readonly routeForm = this.fb.group({
    date: this.fb.control<Date | null>({ value: null, disabled: true }, { validators: Validators.required }),
    driverId: this.fb.control<string>('', { validators: Validators.required, nonNullable: true }),
    deliveries: this.fb.control<Delivery[]>([], {
      validators: [Validators.required, Validators.minLength(1)],
      nonNullable: true
    })
  });

  readonly deliveries = this.logisticStore.deliveries;
  readonly warehouses = this.logisticStore.warehouses;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
  readonly selectedDeliveryIds = signal<Delivery['id'][]>([]);
  readonly isCalculatingRoutes = signal(false);
  readonly calculatedRoutePath = signal<google.maps.LatLngLiteral[] | null>(null);
  readonly calculatedRouteOrder = signal<Delivery['id'][] | null>(null);
  readonly routeOrigin = signal<RouteOriginMarker | null>(null);
  readonly computedOriginWarehouse = signal<Warehouse | null>(null);

  private readonly routeDate = signal<Date | null>(null);

  readonly selectedDeliveries = computed(() => {
    const deliveriesById = new Map(this.deliveries().map((delivery) => [delivery.id, delivery]));

    return this.selectedDeliveryIds()
      .map((id) => deliveriesById.get(id))
      .filter((delivery): delivery is Delivery => !!delivery);
  });
  readonly selectedDeliveriesCount = computed(() => this.selectedDeliveries().length);
  readonly availableDeliveries = computed(() => {
    const selectedIds = new Set(this.selectedDeliveryIds());
    const routeDate = this.routeDate();

    return this.deliveries().filter((delivery) => {
      if (selectedIds.has(delivery.id)) {
        return false;
      }

      if (!routeDate) {
        return true;
      }

      const deliveryDate = this.getDateOnly(delivery.deliveryDate);

      return deliveryDate ? this.isSameDay(deliveryDate, routeDate) : false;
    });
  });

  readonly deliveryUsers = signal<AppUser[]>([]);
  readonly isLoadingDeliveryUsers = signal(false);
  readonly isCreatingRoute = signal(false);

  private readonly syncDeliveriesControl = effect(() => {
    const deliveries = this.selectedDeliveries();

    this.routeForm.controls.deliveries.setValue(deliveries, { emitEvent: false });
    this.routeForm.controls.deliveries.updateValueAndValidity({ emitEvent: false });
  });

  private readonly syncRouteDateControl = effect(() => {
    const date = this.routeDate();
    const control = this.routeForm.controls.date;
    const shouldEnable = !!date;

    if (shouldEnable && control.disabled) {
      control.enable({ emitEvent: false });
    } else if (!shouldEnable && control.enabled) {
      control.disable({ emitEvent: false });
    }

    const current = control.value;

    const shouldUpdate =
      (!!date && (!current || !this.isSameDay(current, date))) || (!date && !!current);

    if (shouldUpdate) {
      control.setValue(date, { emitEvent: false });
      control.updateValueAndValidity({ emitEvent: false });
    }
  });

  ngOnInit(): void {
    if (!this.deliveries().length) {
      this.logisticStore.loadUnassignedDeliveries();
    }

    if (!this.warehouses().length) {
      this.logisticStore.loadWarehouses();
    }

    this.loadDeliveryUsers();
  }

  async onCalculateRoutes(): Promise<void> {
    if (this.isCalculatingRoutes()) {
      return;
    }

    const apiKey = this.googleMapsApiKey?.trim();

    if (!apiKey) {
      console.warn('Cannot compute routes without a Google Maps API key.');
      return;
    }

    const deliveries = this.selectedDeliveries();

    if (deliveries.length < 2) {
      console.warn('Select at least two deliveries to compute routes.');
      this.resetCalculatedRoute();
      return;
    }

    this.isCalculatingRoutes.set(true);
    this.resetCalculatedRoute();

    try {
      const updateDeliveryLocation = (deliveryId: Delivery['id'], location: Location | null | undefined) =>
        this.logisticStore.updateDeliveryLocation(deliveryId, location);
      const getDeliveryById = (deliveryId: Delivery['id']) =>
        this.deliveries().find((candidate) => candidate.id === deliveryId);

      const deliveriesWithLocation = await this.ensureDeliveriesWithLocation(
        apiKey,
        deliveries,
        updateDeliveryLocation,
        getDeliveryById
      );

      if (deliveriesWithLocation.length < 2) {
        console.warn('Unable to compute routes because fewer than two deliveries have valid locations.');
        return;
      }

      const warehouses = this.warehouses();

      if (!warehouses.length) {
        console.warn('No warehouses are available to use as an origin.');
        return;
      }

      const warehousesWithLocation = await this.ensureWarehousesWithLocation(apiKey, warehouses);

      if (!warehousesWithLocation.length) {
        console.warn('Unable to determine the location of any warehouse. Route computation skipped.');
        return;
      }

      const nearestWarehouse = await this.findNearestWarehouseCandidate(
        apiKey,
        deliveriesWithLocation,
        warehousesWithLocation
      );

      if (!nearestWarehouse) {
        console.warn('Unable to determine the closest warehouse to the selected deliveries.');
        return;
      }

      const result = await this.routeComputation.computeRoute(apiKey, deliveries, {
        origin: {
          id: nearestWarehouse.warehouse.id,
          location: nearestWarehouse.location
        },
        preferredStartDeliveryId: nearestWarehouse.nearestDeliveryId,
        updateDeliveryLocation,
        getDeliveryById
      });

      if (!result) {
        return;
      }

      const orderedIds = result.optimalRoute.order.map((node) => node.delivery.id);

      this.calculatedRouteOrder.set(orderedIds);
      this.calculatedRoutePath.set(result.routePath);
      this.selectedDeliveryIds.set(orderedIds);
      this.routeOrigin.set({
        id: nearestWarehouse.warehouse.id,
        label: nearestWarehouse.warehouse.name,
        position: this.toLatLngLiteral(nearestWarehouse.location)
      });
      this.computedOriginWarehouse.set({
        ...nearestWarehouse.warehouse,
        location: nearestWarehouse.location
      });

      console.info('Optimal delivery route computed.', {
        orderedDeliveries: orderedIds,
        totalDistanceMeters: result.optimalRoute.totalDistance,
        originWarehouseId: nearestWarehouse.warehouse.id
      });
    } catch (error) {
      console.error('Failed to compute routes between deliveries.', error);
    } finally {
      this.isCalculatingRoutes.set(false);
    }
  }

  async onDeliveryToggled(delivery: Delivery): Promise<void> {
    const current = this.selectedDeliveryIds();
    const exists = current.includes(delivery.id);
    const deliveryDate = this.getDateOnly(delivery.deliveryDate);

    this.resetCalculatedRoute();

    if (!deliveryDate) {
      return;
    }

    if (exists) {
      const updated = current.filter((id) => id !== delivery.id);

      this.selectedDeliveryIds.set(updated);

      if (!updated.length) {
        this.routeDate.set(null);
      }

      return;
    }

    const routeDate = this.routeDate();

    if (routeDate && !this.isSameDay(routeDate, deliveryDate)) {
      return;
    }

    if (!routeDate) {
      this.routeDate.set(deliveryDate);
    }

    this.selectedDeliveryIds.set([...current, delivery.id]);

    const apiKey = this.googleMapsApiKey?.trim() ?? '';

    await this.routeComputation.tryPopulateDeliveryLocation(apiKey, delivery, (deliveryId, location) =>
      this.logisticStore.updateDeliveryLocation(deliveryId, location)
    );
  }

  onSubmit(): void {
    if (this.isCreatingRoute()) {
      return;
    }

    this.routeForm.markAllAsTouched();

    if (!this.routeForm.valid) {
      return;
    }

    const warehouse = this.computedOriginWarehouse();

    if (!warehouse) {
      console.warn('Calculate the optimal route to determine the origin warehouse before submitting.');
      return;
    }

    const { date, driverId, deliveries } = this.routeForm.getRawValue();
    const calculatedOrder = this.calculatedRouteOrder();

    if (!date) {
      console.warn('Select deliveries with a valid date before submitting.');
      return;
    }

    if (!deliveries?.length) {
      console.warn('Select at least one delivery before submitting.');
      return;
    }

    if (!calculatedOrder?.length) {
      console.warn('Compute the optimal route before submitting.');
      return;
    }

    const deliveriesById = new Map(deliveries.map((delivery) => [delivery.id, delivery]));
    const orderedDeliveries = calculatedOrder
      .map((id) => deliveriesById.get(id))
      .filter((delivery): delivery is Delivery => !!delivery);

    if (orderedDeliveries.length !== deliveries.length) {
      console.warn('Recalculate the optimal route to match the selected deliveries before submitting.');
      return;
    }

    const payload: CreateRoute = {
      date: this.formatDateOnly(date),
      driverId,
      deliveries: orderedDeliveries,
      warehouse
    };

    this.isCreatingRoute.set(true);

    this.logisticService
      .createRoute(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (route) => {
          console.info('Route created successfully', route);
          this.isCreatingRoute.set(false);
        },
        error: (error) => {
          console.error('Failed to create route.', error);
          this.isCreatingRoute.set(false);
        }
      });
  }

  private loadDeliveryUsers(): void {
    this.isLoadingDeliveryUsers.set(true);

    this.usersService
      .getDeliveryUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items }) => {
          this.deliveryUsers.set(items ?? []);
          this.isLoadingDeliveryUsers.set(false);
        },
        error: (error) => {
          console.error('Failed to load delivery users.', error);
          this.deliveryUsers.set([]);
          this.isLoadingDeliveryUsers.set(false);
        }
      });
  }

  private async ensureDeliveriesWithLocation(
    apiKey: string,
    deliveries: Delivery[],
    updateDeliveryLocation: (deliveryId: Delivery['id'], location: Location | null | undefined) => void,
    getDeliveryById: (deliveryId: Delivery['id']) => Delivery | undefined
  ): Promise<Array<{ delivery: Delivery; location: Location }>> {
    const resolved = await Promise.all(
      deliveries.map(async (delivery) => {
        const location = await this.routeComputation.ensureDeliveryLocation(apiKey, delivery, {
          updateDeliveryLocation,
          getDeliveryById
        });

        if (!this.isValidLocation(location)) {
          return null;
        }

        return { delivery, location };
      })
    );

    return resolved.filter((item): item is { delivery: Delivery; location: Location } => item !== null);
  }

  private async ensureWarehousesWithLocation(
    apiKey: string,
    warehouses: Warehouse[]
  ): Promise<Array<{ warehouse: Warehouse; location: Location }>> {
    const resolved = await Promise.all(
      warehouses.map(async (warehouse) => {
        const location = await this.ensureWarehouseLocation(apiKey, warehouse);

        if (!this.isValidLocation(location)) {
          return null;
        }

        return { warehouse, location };
      })
    );

    return resolved.filter((item): item is { warehouse: Warehouse; location: Location } => item !== null);
  }

  private formatDateOnly(value: Date | null): string {
    if (!value || Number.isNaN(value.getTime())) {
      return '';
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private async ensureWarehouseLocation(apiKey: string, warehouse: Warehouse): Promise<Location | null> {
    if (this.isValidLocation(warehouse.location)) {
      return warehouse.location;
    }

    const address = warehouse.address?.trim();

    if (!address) {
      console.warn(`Warehouse "${warehouse.id}" is missing an address. Location cannot be determined.`);
      return null;
    }

    try {
      const geoLocation = await this.googleMapsLoader.geocodeAddress(apiKey, address);

      if (!geoLocation) {
        return null;
      }

      const location: Location = {
        latitude: geoLocation.lat,
        longitude: geoLocation.lng
      };

      this.logisticStore.updateWarehouseLocation(warehouse.id, location);

      return location;
    } catch (error) {
      console.error(`Failed to resolve location for warehouse "${warehouse.id}".`, error);
      return null;
    }
  }

  private async findNearestWarehouseCandidate(
    apiKey: string,
    deliveries: Array<{ delivery: Delivery; location: Location }>,
    warehouses: Array<{ warehouse: Warehouse; location: Location }>
  ): Promise<{
    warehouse: Warehouse;
    location: Location;
    nearestDeliveryId: Delivery['id'];
    distance: number;
  } | null> {
    let bestMatch: {
      warehouse: Warehouse;
      location: Location;
      nearestDeliveryId: Delivery['id'];
      distance: number;
    } | null = null;

    for (const candidate of warehouses) {
      const distanceResults = await Promise.all(
        deliveries.map(async (node) => {
          try {
            const distance = await this.googleMapsLoader.computeDistanceBetween(
              apiKey,
              candidate.location,
              node.location
            );

            if (typeof distance !== 'number' || Number.isNaN(distance)) {
              return null;
            }

            return { id: node.delivery.id, distance };
          } catch (error) {
            console.warn(
              `Failed to compute distance between warehouse "${candidate.warehouse.id}" and delivery "${node.delivery.id}".`,
              error
            );

            return null;
          }
        })
      );

      const nearestDelivery = distanceResults.reduce<{ id: Delivery['id']; distance: number } | null>(
        (best, current) => {
          if (!current) {
            return best;
          }

          if (!best || current.distance < best.distance) {
            return current;
          }

          return best;
        },
        null
      );

      if (!nearestDelivery) {
        continue;
      }

      if (!bestMatch || nearestDelivery.distance < bestMatch.distance) {
        bestMatch = {
          warehouse: candidate.warehouse,
          location: candidate.location,
          nearestDeliveryId: nearestDelivery.id,
          distance: nearestDelivery.distance
        };
      }
    }

    return bestMatch;
  }

  private resetCalculatedRoute(): void {
    this.calculatedRouteOrder.set(null);
    this.calculatedRoutePath.set(null);
    this.routeOrigin.set(null);
    this.computedOriginWarehouse.set(null);
  }

  private toLatLngLiteral(location: Location): google.maps.LatLngLiteral {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  private isValidLocation(value: Location | null | undefined): value is Location {
    return (
      typeof value?.latitude === 'number' &&
      Number.isFinite(value.latitude) &&
      typeof value.longitude === 'number' &&
      Number.isFinite(value.longitude)
    );
  }

  private getDateOnly(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  private isSameDay(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

}
