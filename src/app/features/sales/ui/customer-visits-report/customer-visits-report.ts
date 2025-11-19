import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TranslocoDirective } from '@ngneat/transloco';
import { ReportCustomerVisit } from '../../../../shared/models/reportCustomerVisit.model';

@Component({
  selector: 'app-customer-visits-report',
  imports: [CommonModule, MatTableModule, TranslocoDirective],
  templateUrl: './customer-visits-report.html',
  styleUrl: './customer-visits-report.scss'
})
export class CustomerVisitsReport {
  visits = input.required<ReportCustomerVisit[]>();

  displayedColumns: string[] = ['position', 'sellerName', 'customerName', 'visitStatus', 'visitDate'];

  tableData = computed(() => {
    return this.visits().map((visit, index) => ({
      position: index + 1,
      sellerName: visit.seller?.name || 'N/A',
      customerName: visit.customer?.name || 'N/A',
      visitStatus: visit.status || 'N/A',
      visitDate: visit.visitDate
    }));
  });

  getStatusClass(status: string): string {
    if (!status) return 'default';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'realizada':
        return 'completed';
      case 'pendiente':
        return 'pending';
      case 'cancelada':
        return 'cancelled';
      default:
        return 'default';
    }
  }
}
