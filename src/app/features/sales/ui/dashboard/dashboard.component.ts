import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { SalesDataService, DashboardSummary, ChartData } from '../../services/sales-data.service';
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
    TranslocoDirective,
    BaseChartDirective,
    SummaryCardsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private salesDataService = inject(SalesDataService);
  private translocoService = inject(TranslocoService);

  // Date filters
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Summary data
  summary: DashboardSummary = {
    totalSales: 0,
    currentSellerSales: 0,
    sellerName: ''
  };

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
    // Set default date range (last 90 days)
    const today = new Date();
    this.endDate = today;
    this.startDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    this.loadDashboardData();
  }

  onApplyFilters(): void {
    this.loadDashboardData();
  }

  onClearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load dashboard summary
    this.summary = this.salesDataService.getDashboardSummary(
      this.startDate || undefined,
      this.endDate || undefined
    );

    // Load company chart data
    const companyData = this.salesDataService.getChartDataByCompany(
      this.startDate || undefined,
      this.endDate || undefined
    );
    this.companyChartData = {
      labels: companyData.labels,
      datasets: [{
        data: companyData.data,
        backgroundColor: companyData.colors || []
      }]
    };

    // Load customer chart data
    const customerData = this.salesDataService.getChartDataByCustomer(
      this.startDate || undefined,
      this.endDate || undefined
    );
    this.customerChartData = {
      labels: customerData.labels,
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: customerData.data,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    };

    // Load product chart data
    const productData = this.salesDataService.getChartDataByProduct(
      this.startDate || undefined,
      this.endDate || undefined
    );
    this.productChartData = {
      labels: productData.labels,
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: productData.data,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
  }

}
