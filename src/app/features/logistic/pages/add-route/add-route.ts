import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
    MatCardModule
  ],
  templateUrl: './add-route.html',
  styleUrl: './add-route.scss'
})
export class AddRoute implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly logisticStore = inject(LogisticStore);

  readonly routeForm = this.fb.group({
    date: this.fb.control<Date | null>(null, { validators: Validators.required }),
    driverId: this.fb.control<string>('', { validators: Validators.required, nonNullable: true }),
    deliveries: this.fb.control<Delivery[]>([], { validators: Validators.required, nonNullable: true })
  });

  readonly deliveries = this.logisticStore.deliveries;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
  readonly selectedDeliveryIds = signal<Delivery['id'][]>([]);

  readonly selectedDeliveries = computed(() => this.routeForm.controls.deliveries.value);
  readonly selectedDeliveriesCount = computed(() => this.selectedDeliveries().length);

  ngOnInit(): void {
    if (!this.deliveries().length) {
      this.logisticStore.loadMockDeliveries();
    }
  }

  onDeliveryToggled(delivery: Delivery): void {
    const current = this.selectedDeliveryIds();
    const exists = current.includes(delivery.id);
    const updated = exists ? current.filter((id) => id !== delivery.id) : [...current, delivery.id];
    const deliveries = this.deliveries().filter((item) => updated.includes(item.id));

    this.selectedDeliveryIds.set(updated);
    this.routeForm.controls.deliveries.setValue(deliveries);
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
}
