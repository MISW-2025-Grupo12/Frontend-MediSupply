import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore } from '../../../core/state/app.store';
import { LocaleRouteService } from '../../../core/services/locale-route.service';
import { SalesDataService } from '../services/sales-data.service';
import { SalesReport } from '../../../shared/models/salesReport.model';

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

  readonly salesReport = computed(() => this._salesReport());

  loadSalesReport(): void {
    this.salesDataService.getSalesReportData().subscribe(salesReport => {
      this._salesReport.set(salesReport);
    });
  }
}
