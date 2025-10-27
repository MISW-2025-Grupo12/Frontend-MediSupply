import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { AppUser } from '../../../../shared/models/user.model';
import { SalesState } from '../../state/sales.store';
import { ScheduledVisit, VisitStatus } from '../../../../shared/models/scheduledVisit.model';
import { SalesPlanFilters } from './sales-plan-filters/sales-plan-filters';
import { ScheduledVisits } from './scheduled-visits/scheduled-visits';
import { CustomerList } from './customer-list/customer-list';

@Component({
  selector: 'app-create-sales-plan-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    TranslocoDirective,
    SalesPlanFilters,
    ScheduledVisits,
    CustomerList
  ],
  templateUrl: './create-sales-plan-form.html',
  styleUrl: './create-sales-plan-form.scss'
})
export class CreateSalesPlanForm implements OnInit {
  private fb = inject(FormBuilder);
  private salesState = inject(SalesState);

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  salesPlanForm!: FormGroup;
  customers = this.salesState.customers;
  scheduledVisits = signal<ScheduledVisit[]>([]);
  selectedCustomerForVisit: AppUser | null = null;

  ngOnInit(): void {
    this.initForm();
    this.salesState.loadCustomers();
  }

  private initForm(): void {
    this.salesPlanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }


  onSubmit(): void {
    if (this.salesPlanForm.valid) {
      const formData = {
        ...this.salesPlanForm.value,
        scheduledVisits: this.scheduledVisits()
      };
      this.formSubmit.emit(formData);
      console.log('Form submitted:', formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.salesPlanForm.controls).forEach(key => {
        this.salesPlanForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onScheduleVisit(customer: AppUser): void {
    this.selectedCustomerForVisit = customer;
  }

  onDateSelected(customer: AppUser, date: Date): void {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert('Cannot schedule visits for past dates');
      return;
    }

    const existingVisitOnSameDate = this.scheduledVisits().find(v => {
      if (v.customerId !== customer.id) return false;
      const existingDate = new Date(v.scheduledDate);
      const newDate = new Date(date);
      return existingDate.toDateString() === newDate.toDateString();
    });

    if (existingVisitOnSameDate) {
      alert('This customer already has a visit scheduled on this date');
      return;
    }

    const newVisit: ScheduledVisit = {
      id: Date.now(),
      customerId: customer.id,
      customerName: customer.name,
      scheduledDate: date,
      scheduledTime: '09:00',
      status: VisitStatus.PENDING
    };

    this.scheduledVisits.update(visits => [...visits, newVisit]);
    this.selectedCustomerForVisit = null;
  }

  onCancelDateSelection(): void {
    this.selectedCustomerForVisit = null;
  }

  isCustomerSelectedForVisit(customerId: string): boolean {
    return this.selectedCustomerForVisit?.id === customerId;
  }

  getMinDate(): Date {
    return new Date();
  }

  onRemoveVisit(visitId: string | number): void {
    this.scheduledVisits.update(visits => visits.filter(v => v.id !== visitId));
  }
}
