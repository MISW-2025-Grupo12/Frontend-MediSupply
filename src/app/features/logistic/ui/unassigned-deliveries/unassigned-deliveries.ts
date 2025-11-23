import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { Delivery } from '../../../../shared/models/delivery.model';

@Component({
  selector: 'app-unassigned-deliveries',
  imports: [CommonModule, TranslocoDirective, DatePipe, CurrencyPipe],
  templateUrl: './unassigned-deliveries.html',
  styleUrl: './unassigned-deliveries.scss'
})
export class UnassignedDeliveries {
  readonly deliveries = input.required<Delivery[]>();
  readonly selectable = input<boolean>(false);
  readonly selectedDeliveryIds = input<ReadonlyArray<Delivery['id']>>([]);

  readonly deliveryToggled = output<Delivery>();

  readonly totalDeliveries = computed(() => this.deliveries().length);

  isDeliverySelected(delivery: Delivery): boolean {
    return this.selectedDeliveryIds().includes(delivery.id);
  }

  toggleDelivery(delivery: Delivery): void {
    this.deliveryToggled.emit(delivery);
  }

  statusKey(status: string | undefined): string {
    return status
      ? status
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/_/g, '-')
      : 'unknown';
  }
}
