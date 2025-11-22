import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { AppStore } from '../../../../core/state/app.store';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { UserType } from '../../../../shared/enums/user-type';

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
export class SalesReportComponent implements OnInit {
  salesState = inject(SalesState);
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);

  showCustomerVisitsReport = signal<boolean>(false);
  startDate: Date | null = null;
  endDate: Date | null = null;

  visitCount = computed(() => this.salesState.reportCustomerVisits().length);

  ngOnInit(): void {
    // Check if user is admin, redirect if not
    const currentUser = this.appStore.user();
    if (!currentUser || currentUser.role !== UserType.ADMIN) {
      const locale = this.localeRouteService.getCurrentLocale();
      const dashboardPath = locale === 'en' ? 'dashboard' : 'panel';
      this.router.navigate([`/${locale}/${dashboardPath}`]);
      return;
    }
  }

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
