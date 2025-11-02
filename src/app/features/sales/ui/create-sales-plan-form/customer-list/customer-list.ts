import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { AppUser } from '../../../../../shared/models/user.model';
import { ScheduledVisit } from '../../../../../shared/models/scheduledVisit.model';

@Component({
  selector: 'app-customer-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    TranslocoDirective
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss'
})
export class CustomerList {
  private _customers = signal<AppUser[]>([]);
  searchTerm = signal<string>('');
  filteredCustomers = signal<AppUser[]>([]);
  
  @Input() set customers(value: any) {
    if (value) {
      this._customers.set(typeof value === 'function' ? value() : value);
      this.filterCustomers();
    }
  }
  
  get customers() {
    return this._customers;
  }
  
  @Input() scheduledVisits = signal<ScheduledVisit[]>([]);
  @Input() selectedCustomerForVisit: AppUser | null = null;
  @Input() onScheduleVisit!: (customer: AppUser) => void;
  @Input() onDateSelected!: (customer: AppUser, date: Date) => void;
  @Input() onCancelDateSelection!: () => void;
  @Input() getMinDate!: () => Date;
  @Input() getMaxDate?: () => Date | null;
  @Input() isCustomerSelectedForVisit!: (customerId: string) => boolean;

  getMinDateValue(): Date {
    return this.getMinDate();
  }

  getMaxDateValue(): Date | null {
    return this.getMaxDate ? this.getMaxDate() : null;
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filterCustomers();
  }

  private filterCustomers(): void {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.filteredCustomers.set(this.customers());
      return;
    }

    const filtered = this.customers().filter((customer: AppUser) => 
      customer.name.toLowerCase().includes(term)
    );
    
    this.filteredCustomers.set(filtered);
  }

  getCustomersToDisplay(): AppUser[] {
    return this.filteredCustomers().length > 0 || this.searchTerm().trim() !== ''
      ? this.filteredCustomers()
      : this.customers();
  }
}

