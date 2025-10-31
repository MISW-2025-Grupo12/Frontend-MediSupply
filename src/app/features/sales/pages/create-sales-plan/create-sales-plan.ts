import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { CreateSalesPlanForm } from '../../ui/create-sales-plan-form/create-sales-plan-form';
import { SalesState } from '../../state/sales.store';
import { AppStore } from '../../../../core/state/app.store';
import { CreateSalesPlanModel, CreateVisitClient } from '../../../../shared/models/createSalesPlan.model';
import { ScheduledVisit } from '../../../../shared/models/scheduledVisit.model';

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
export class CreateSalesPlan {
  private localeRouteService = inject(LocaleRouteService);
  private salesState = inject(SalesState);
  private appStore = inject(AppStore);

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
    const salesPlan: CreateSalesPlanModel = {
      name: formData.name,
      startDate: formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate),
      endDate: formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate),
      userId: currentUser.id,
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
