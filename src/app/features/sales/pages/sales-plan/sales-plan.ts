import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';
import { SalesPlan } from '../../../../shared/models/salesPlan.model';
import { CustomerVisit } from '../../../../shared/models/customerVisit.model';

@Component({
  selector: 'app-sales-plan',
  imports: [CommonModule, TranslocoDirective, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './sales-plan.html',
  styleUrl: './sales-plan.scss'
})
export class SalesPlanComponent implements OnInit {
  private localeRouteService = inject(LocaleRouteService);
  private router = inject(Router);
  private salesState = inject(SalesState);

  salesPlans = this.salesState.salesPlans;

  ngOnInit(): void {
    this.salesState.loadSalesPlans();
  }

  navigateToAddSalesPlan(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'addSalesPlan']);
  }

  navigateToSalesPlanDetail(planId: string | number): void {
    const locale = this.localeRouteService.getCurrentLocale();
    // Build path segments: [locale, 'ventas' or 'sales', 'plan-de-ventas' or 'sales-plan', id]
    const salesSegment = locale === 'es' ? 'ventas' : 'sales';
    const planSegment = locale === 'es' ? 'plan-de-ventas' : 'sales-plan';
    this.router.navigate([locale, salesSegment, planSegment, planId.toString()]);
  }

  getTotalVisits(salesPlan: SalesPlan): number {
    return salesPlan.customerVisits?.reduce((total: number, visit: CustomerVisit) => total + (visit.visits?.length || 0), 0) || 0;
  }

  getTotalCustomers(salesPlan: SalesPlan): number {
    return salesPlan.customerVisits?.length || 0;
  }
}
