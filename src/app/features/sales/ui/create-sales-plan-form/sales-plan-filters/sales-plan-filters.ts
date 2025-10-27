import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-plan-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    TranslocoDirective
  ],
  templateUrl: './sales-plan-filters.html',
  styleUrl: './sales-plan-filters.scss'
})
export class SalesPlanFilters {
  @Input() salesPlanForm!: FormGroup;

  getErrorMessage(fieldName: string): string {
    const control = this.salesPlanForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'addSalesPlan.form.required';
    }
    if (control?.hasError('minlength')) {
      return 'addSalesPlan.form.required';
    }
    return '';
  }
}

