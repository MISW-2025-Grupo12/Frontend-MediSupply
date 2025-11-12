import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';
import { Delivery } from '../../../../shared/models/delivery.model';
import { CreateRoute } from '../../../../shared/models/createRoute.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Maps } from '../../../../shared/components/maps/maps';
import { RouteComputationService } from '../../../../core/services/route-computation.service';
import { environment } from '../../../../../environments/environment';
import { SelectedDeliveries } from '../../ui/selected-deliveries/selected-deliveries';

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
    Maps
  ],
  templateUrl: './add-route.html',
  styleUrl: './add-route.scss'
})
export class AddRoute implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly logisticStore = inject(LogisticStore);
  private readonly routeComputation = inject(RouteComputationService);
  private readonly googleMapsApiKey = environment.googleMapsApiKey;

  readonly routeForm = this.fb.group({
    date: this.fb.control<Date | null>(null, { validators: Validators.required }),
    driverId: this.fb.control<string>('', { validators: Validators.required, nonNullable: true }),
    deliveries: this.fb.control<Delivery[]>([], { validators: Validators.required, nonNullable: true })
  });

  readonly deliveries = this.logisticStore.deliveries;
  readonly warehouses = this.logisticStore.warehouses;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
  readonly selectedDeliveryIds = signal<Delivery['id'][]>([]);
  private readonly routeDate = signal<Date | null>(null);
  readonly isCalculatingRoutes = signal(false);
  readonly calculatedRoutePath = signal<google.maps.LatLngLiteral[] | null>(null);
  readonly calculatedRouteOrder = signal<Delivery['id'][] | null>(null);

  readonly selectedDeliveries = computed(() => {
    const selectedIds = new Set(this.selectedDeliveryIds());

    return this.deliveries().filter((delivery) => selectedIds.has(delivery.id));
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
  private readonly syncSelectedDeliveries = effect(() => {
    const deliveries = this.selectedDeliveries();

    this.routeForm.controls.deliveries.setValue(deliveries, { emitEvent: false });
  });

  ngOnInit(): void {
    this.routeForm.controls.date.disable({ emitEvent: false });

    if (!this.deliveries().length) {
      this.logisticStore.loadMockDeliveries();
    }

    if (!this.warehouses().length) {
      this.logisticStore.loadWarehouses();
    }
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
      const result = await this.routeComputation.computeRoute(apiKey, deliveries, {
        updateDeliveryLocation: (deliveryId, location) =>
          this.logisticStore.updateDeliveryLocation(deliveryId, location),
        getDeliveryById: (deliveryId) => this.deliveries().find((candidate) => candidate.id === deliveryId)
      });

      if (!result) {
        return;
      }

      const orderedIds = result.optimalRoute.order.map((node) => node.delivery.id);

      this.calculatedRouteOrder.set(orderedIds);
      this.calculatedRoutePath.set(result.routePath);
      console.info('Optimal delivery route computed.', {
        orderedDeliveries: result.optimalRoute.order.map((node) => node.delivery.id),
        totalDistanceMeters: result.optimalRoute.totalDistance
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
        this.routeForm.controls.date.setValue(null, { emitEvent: false });
      }

      return;
    }

    const routeDate = this.routeDate();

    if (routeDate && !this.isSameDay(routeDate, deliveryDate)) {
      return;
    }

    if (!routeDate) {
      this.routeDate.set(deliveryDate);
      this.routeForm.controls.date.setValue(deliveryDate, { emitEvent: false });
    }

    this.selectedDeliveryIds.set([...current, delivery.id]);

    const apiKey = this.googleMapsApiKey?.trim() ?? '';

    await this.routeComputation.tryPopulateDeliveryLocation(apiKey, delivery, (deliveryId, location) =>
      this.logisticStore.updateDeliveryLocation(deliveryId, location)
    );
  }

  onSubmit(): void {
    if (this.routeForm.valid) {
      const { date, driverId, deliveries } = this.routeForm.getRawValue();
      const payload: CreateRoute = {
        date: date ? date.toISOString().split('T')[0] : '',
        driverId,
        deliveries
      };
      console.info('Route draft', payload);
    }
  }

  private resetCalculatedRoute(): void {
    this.calculatedRouteOrder.set(null);
    this.calculatedRoutePath.set(null);
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
