import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { SalesState } from '../../state/sales.store';
import { SummaryCardsComponent } from '../summary-cards/summary-cards.component';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
    BaseChartDirective,
    SummaryCardsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private salesState = inject(SalesState);
  private translocoService = inject(TranslocoService);

  // Date filters
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Sales report data
  salesReport = this.salesState.salesReport;
  isLoading = this.salesState.isLoading;
  
  // Computed property to check if report has data
  get hasData(): boolean {
    const report = this.salesReport();
    return report.totalSales > 0 || 
           Object.keys(report.salesByMonth || {}).length > 0 ||
           (report.salesByCustomer || []).length > 0 ||
           (report.mostSoldProducts || []).length > 0;
  }

  private salesReportEffect = effect(() => {
    this.salesReport(); // This triggers the effect when the signal changes
    this.updateChartData();
  });

  // Chart configurations
  companyChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };

  customerChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Sales Amount',
      data: [],
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      borderWidth: 1
    }]
  };

  productChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Sales Amount',
      data: [],
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1
    }]
  };

  // Chart options
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    }
  };

  // Chart types are now defined directly in the template

  ngOnInit(): void {
    // Set default date filters to empty
    this.startDate = null;
    this.endDate = null;
    
    this.loadSalesReport();
  }

  onApplyFilters(): void {
    // Date validation rules:
    // 1. Either startDate or endDate can be null/undefined (optional filters)
    // 2. Only validate range if BOTH dates are provided
    // 3. If both are provided, endDate cannot be before startDate
    
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      // Handle invalid date range - swap dates to fix the issue
      const temp = this.startDate;
      this.startDate = this.endDate;
      this.endDate = temp;
    }
    
    this.loadSalesReport();
  }

  onClearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadSalesReport();
  }

  private loadSalesReport(): void {
    this.salesState.loadSalesReport(this.startDate || undefined, this.endDate || undefined);
  }

  private updateChartData(): void {
    const report = this.salesReport();
    
    // Update sales by month chart (using doughnut for company representation)
    this.companyChartData = {
      labels: Object.keys(report.salesByMonth || {}),
      datasets: [{
        data: Object.values(report.salesByMonth || {}).map(value => typeof value === 'number' ? value : 0),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      }]
    };

    // Update sales by customer chart
    const sortedCustomers = (report.salesByCustomer || [])
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 8);

    this.customerChartData = {
      labels: sortedCustomers.map(customer => customer.name),
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: sortedCustomers.map(customer => customer.totalAmount),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    };

    // Update most sold products chart
    const sortedProducts = (report.mostSoldProducts || [])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    this.productChartData = {
      labels: sortedProducts.map(product => product.name),
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: sortedProducts.map(product => product.quantity),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
  }

}
