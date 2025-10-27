import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { CreateSalesPlanForm } from '../../ui/create-sales-plan-form/create-sales-plan-form';

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

  onFormSubmit(formData: any): void {
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  }

  onCancel(): void {
    this.onBack();
  }

  onBack(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesPlan']);
  }
}
