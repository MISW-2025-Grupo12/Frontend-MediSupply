import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore } from '../../../core/state/app.store';
import { LocaleRouteService } from '../../../core/services/locale-route.service';
import { SalesDataService } from '../services/sales-data.service';
import { SalesReport } from '../../../shared/models/salesReport.model';
import { AppUser } from '../../../shared/models/user.model';
import { ScheduledVisit } from '../../../shared/models/scheduledVisit.model';

@Injectable({ providedIn: 'root' })
export class SalesState {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);
  private salesDataService = inject(SalesDataService);

  private _salesReport = signal<SalesReport>({
    totalSales: 0,
    totalProductsSold: 0,
    salesByMonth: {},
    salesByCustomer: [],
    mostSoldProducts: []
  });

  private _isLoading = signal<boolean>(false);
  private _customers = signal<AppUser[]>([]);
  private _scheduledVisits = signal<ScheduledVisit[]>([]);

  readonly salesReport = computed(() => this._salesReport());
  readonly isLoading = computed(() => this._isLoading());
  readonly customers = computed(() => this._customers());
  readonly scheduledVisits = computed(() => this._scheduledVisits());

  loadCustomers(): void {
    this.salesDataService.getCustomers().subscribe(customers => {
      this._customers.set(customers);
    });
  }

  loadScheduledVisits(salesPlanId?: string | number): void {
    // TODO: Replace with actual API call when backend is ready
    // For now, using empty array as placeholder
    this._scheduledVisits.set([]);
    
    // Uncomment when backend is ready:
    // this.salesDataService.getScheduledVisits(salesPlanId).subscribe(visits => {
    //   this._scheduledVisits.set(visits);
    // });
  }

  addScheduledVisit(visit: ScheduledVisit): void {
    this._scheduledVisits.update(visits => [...visits, visit]);
  }

  loadSalesReport(startDate?: Date, endDate?: Date): void {
    this._isLoading.set(true);
    this.salesDataService.getSalesReportData(startDate, endDate).subscribe({
      next: (salesReport) => {
        this._salesReport.set(salesReport);
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading sales report:', error);
        this._isLoading.set(false);
      }
    });
  }
}
