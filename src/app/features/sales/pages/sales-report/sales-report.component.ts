import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SalesState } from '../../state/sales.store';
import { CustomerVisitsReport } from '../../ui/customer-visits-report/customer-visits-report';

@Component({
  selector: 'app-sales-report.component',
  imports: [
    CommonModule,
    FormsModule,
    TranslocoDirective, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CustomerVisitsReport
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent {
  salesState = inject(SalesState);

  showCustomerVisitsReport = signal<boolean>(false);
  startDate: Date | null = null;
  endDate: Date | null = null;

  visitCount = computed(() => this.salesState.reportCustomerVisits().length);

  loadReportCustomerVisits(): void {
    // Validate date range
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      const temp = this.startDate;
      this.startDate = this.endDate;
      this.endDate = temp;
    }
    
    this.salesState.loadReportCustomerVisits(undefined, this.startDate || undefined, this.endDate || undefined);
    this.showCustomerVisitsReport.set(true);
  }

  onApplyFilters(): void {
    this.loadReportCustomerVisits();
  }

  onClearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadReportCustomerVisits();
  }
}
