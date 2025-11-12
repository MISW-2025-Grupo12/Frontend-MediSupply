import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { Delivery } from '../../../../shared/models/delivery.model';

@Component({
  selector: 'app-selected-deliveries',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './selected-deliveries.html',
  styleUrl: './selected-deliveries.scss'
})
export class SelectedDeliveries {
  @Input({ required: true }) deliveries: Delivery[] = [];
  @Input({ required: true }) count = 0;
  @Output() deliveryToggled = new EventEmitter<Delivery>();
}
