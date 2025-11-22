import { Component, computed, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
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
  
  hasScheduledVisits = computed(() => this.scheduledVisits().length > 0);
  
  get isFormValid(): boolean {
    return this.salesPlanForm?.valid && this.hasScheduledVisits();
  }

  ngOnInit(): void {
    this.initForm();
    this.salesState.loadCustomers();
  }

  private initForm(): void {
    this.salesPlanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      sellerId: ['', Validators.required]
    });
  }


  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.salesPlanForm.controls).forEach(key => {
      this.salesPlanForm.get(key)?.markAsTouched();
    });

    if (!this.salesPlanForm.valid) {
      return;
    }

    if (this.scheduledVisits().length === 0) {
      alert('At least one scheduled visit is required to create the plan');
      return;
    }

    // Validate that all scheduled visits are within the sales plan period
    const startDate = new Date(this.salesPlanForm.value.startDate);
    const endDate = new Date(this.salesPlanForm.value.endDate);
    
    // Set time to start/end of day for proper comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const visitsOutsidePeriod = this.scheduledVisits().filter(visit => {
      const visitDate = new Date(visit.scheduledDate);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate < startDate || visitDate > endDate;
    });

    if (visitsOutsidePeriod.length > 0) {
      const customerNames = visitsOutsidePeriod.map(v => v.customerName).join(', ');
      alert(`The following scheduled visits are outside the sales plan period (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}): ${customerNames}`);
      return;
    }

    // All validations passed, submit the form
    const formData = {
      ...this.salesPlanForm.value,
      scheduledVisits: this.scheduledVisits()
    };
    this.formSubmit.emit(formData);
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

    // Validate that the selected date is within the sales plan period
    const startDate = this.salesPlanForm.value.startDate ? new Date(this.salesPlanForm.value.startDate) : null;
    const endDate = this.salesPlanForm.value.endDate ? new Date(this.salesPlanForm.value.endDate) : null;

    if (startDate && endDate) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (selectedDate < startDate || selectedDate > endDate) {
        alert(`The scheduled visit date must be within the sales plan period (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`);
        return;
      }
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
    const today = new Date();
    const startDate = this.salesPlanForm.value.startDate ? new Date(this.salesPlanForm.value.startDate) : null;
    
    if (startDate && startDate > today) {
      return startDate;
    }
    return today;
  }

  getMaxDate(): Date | null {
    return this.salesPlanForm.value.endDate ? new Date(this.salesPlanForm.value.endDate) : null;
  }

  onRemoveVisit(visitId: string | number): void {
    this.scheduledVisits.update(visits => visits.filter(v => v.id !== visitId));
  }
}
