import { Component, Input, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { UsersStore } from '../../../../users/state/users.store';

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
    MatSelectModule,
    TranslocoDirective
  ],
  templateUrl: './sales-plan-filters.html',
  styleUrl: './sales-plan-filters.scss'
})
export class SalesPlanFilters {
  @Input() salesPlanForm!: FormGroup;
  private usersStore = inject(UsersStore);

  sellerUsers = this.usersStore.sellerUsers;
  isLoadingSellerUsers = this.usersStore.isLoadingSellerUsers;

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

