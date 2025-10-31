import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';
import { DetailedCustomerVisit } from '../../../../shared/models/customerVisit.model';
import { AppUser } from '../../../../shared/models/user.model';

interface VisitWithCustomer {
  id: string | number;
  visitDate: Date;
  address: string;
  phone: string;
  status?: string;
  customerId: string | number;
  customerName: string;
}

interface GroupedVisits {
  date: Date;
  dateString: string;
  visits: VisitWithCustomer[];
}

@Component({
  selector: 'app-sales-plan-detail',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, TranslocoDirective],
  templateUrl: './sales-plan-detail.html',
  styleUrl: './sales-plan-detail.scss'
})
export class SalesPlanDetail implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private localeRouteService = inject(LocaleRouteService);
  private salesState = inject(SalesState);

  salesPlanId = signal<string | null>(null);
  salesPlan = computed(() => {
    const id = this.salesPlanId();
    if (!id) return null;
    
    const plans = this.salesState.salesPlans();
    return plans.find(plan => plan.id.toString() === id) || null;
  });

  // Group visits by day
  groupedVisits = computed(() => {
    const plan = this.salesPlan();
    const customers = this.salesState.customers();
    
    if (!plan || !plan.customerVisits || plan.customerVisits.length === 0) {
      return [];
    }

    // Create a map of customer ID to customer name
    const customerMap = new Map<string | number, string>();
    customers.forEach(customer => {
      customerMap.set(customer.id, customer.name);
    });

    // Flatten all visits with customer information
    const allVisits: VisitWithCustomer[] = [];
    plan.customerVisits.forEach(customerVisit => {
      const customerName = customerMap.get(customerVisit.id) || `Customer ${customerVisit.id}`;
      customerVisit.visits.forEach(visit => {
        allVisits.push({
          ...visit,
          customerId: customerVisit.id,
          customerName
        });
      });
    });

    // Sort visits by date
    allVisits.sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime());

    // Group by day
    const grouped = new Map<string, VisitWithCustomer[]>();
    allVisits.forEach(visit => {
      const dateKey = this.getDateKey(visit.visitDate);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(visit);
    });

    // Convert to array and format for display
    const result: GroupedVisits[] = Array.from(grouped.entries())
      .map(([dateString, visits]) => ({
        date: visits[0].visitDate,
        dateString,
        visits
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return result;
  });

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  getVisitStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'completada') {
      return 'status-completed';
    } else if (statusLower === 'cancelled' || statusLower === 'cancelada') {
      return 'status-cancelled';
    }
    return 'status-pending';
  }

  ngOnInit(): void {
    // Get the id from route params
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.salesPlanId.set(id);
        // Load sales plans if not already loaded
        if (this.salesState.salesPlans().length === 0) {
          this.salesState.loadSalesPlans();
        }
        // Load customers if not already loaded
        if (this.salesState.customers().length === 0) {
          this.salesState.loadCustomers();
        }
      }
    });
  }

  navigateBack(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesPlan']);
  }
}
