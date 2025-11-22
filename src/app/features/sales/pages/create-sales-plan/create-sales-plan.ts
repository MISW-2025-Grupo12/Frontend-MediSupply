import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { CreateSalesPlanForm } from '../../ui/create-sales-plan-form/create-sales-plan-form';
import { SalesState } from '../../state/sales.store';
import { AppStore } from '../../../../core/state/app.store';
import { CreateSalesPlanModel, CreateVisitClient } from '../../../../shared/models/createSalesPlan.model';
import { ScheduledVisit } from '../../../../shared/models/scheduledVisit.model';
import { UsersStore } from '../../../users/state/users.store';
import { UserType } from '../../../../shared/enums/user-type';

@Component({
  selector: 'app-create-sales-plan',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslocoDirective,
    CreateSalesPlanForm
  ],
  templateUrl: './create-sales-plan.html',
  styleUrl: './create-sales-plan.scss'
})
export class CreateSalesPlan implements OnInit {
  private localeRouteService = inject(LocaleRouteService);
  private salesState = inject(SalesState);
  private appStore = inject(AppStore);
  private usersStore = inject(UsersStore);
  private router = inject(Router);

  ngOnInit(): void {
    // Check if user is admin, redirect if not
    const currentUser = this.appStore.user();
    if (!currentUser || currentUser.role !== UserType.ADMIN) {
      const locale = this.localeRouteService.getCurrentLocale();
      const dashboardPath = locale === 'en' ? 'dashboard' : 'panel';
      this.router.navigate([`/${locale}/${dashboardPath}`]);
      return;
    }

    this.usersStore.loadSellerUsers();
  }

  onFormSubmit(formData: any): void {
    const currentUser = this.appStore.user();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    // Transform scheduledVisits into the CreateVisitClient format
    // Group visits by customerId
    const visitsMap = new Map<string, string[]>();
    
    formData.scheduledVisits.forEach((visit: ScheduledVisit) => {
      const dateString = visit.scheduledDate instanceof Date 
        ? visit.scheduledDate.toISOString().split('T')[0]
        : new Date(visit.scheduledDate).toISOString().split('T')[0];
      
      if (!visitsMap.has(visit.customerId)) {
        visitsMap.set(visit.customerId, []);
      }
      visitsMap.get(visit.customerId)!.push(dateString);
    });

    // Convert map to array of CreateVisitClient
    const visits: CreateVisitClient[] = Array.from(visitsMap.entries()).map(([customerId, visitDates]) => ({
      customerId,
      visits: visitDates
    }));

    // Create the sales plan model
    // Use selected sellerId if provided, otherwise fall back to current user
    const userId = formData.sellerId || currentUser.id;
    
    const salesPlan: CreateSalesPlanModel = {
      name: formData.name,
      startDate: formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate),
      endDate: formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate),
      userId: userId,
      visits
    };

    // Call the state method to create the sales plan
    this.salesState.createSalesPlan(salesPlan).subscribe({
      next: () => {
        this.localeRouteService.navigateToNestedRoute(['sales', 'salesPlan']);
      },
      error: (error) => {
        console.error('Error creating sales plan:', error);
      }
    });
  }

  onCancel(): void {
    this.onBack();
  }

  onBack(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesPlan']);
  }
}
