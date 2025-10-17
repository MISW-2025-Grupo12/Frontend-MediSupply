import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';

import { SalesReport } from '../../../../shared/models/salesReport.model';

@Component({
  selector: 'app-summary-cards',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslocoDirective
  ],
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.scss'
})
export class SummaryCardsComponent {
  @Input() summary: SalesReport = {
    totalSales: 0,
    totalProductsSold: 0,
    salesByMonth: {},
    salesByCustomer: {},
    mostSoldProducts: {}
  };

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
