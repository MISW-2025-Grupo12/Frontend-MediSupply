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
    
    this.loadSalesReport();
  }

  onApplyFilters(): void {
    this.loadSalesReport();
  }

  onClearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadSalesReport();
  }

  private loadSalesReport(): void {
    this.salesState.loadSalesReport();
    this.updateChartData();
  }

  private updateChartData(): void {
    const report = this.salesReport();
    
    // Update sales by month chart (using doughnut for company representation)
    this.companyChartData = {
      labels: Object.keys(report.salesByMonth),
      datasets: [{
        data: Object.values(report.salesByMonth).map(value => typeof value === 'number' ? value : 0),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      }]
    };

    // Update sales by customer chart
    const customerEntries = Object.entries(report.salesByCustomer)
      .sort(([, a], [, b]) => {
        const aVal = typeof a === 'number' ? a : 0;
        const bVal = typeof b === 'number' ? b : 0;
        return bVal - aVal;
      })
      .slice(0, 8);

    this.customerChartData = {
      labels: customerEntries.map(([customer]) => customer),
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: customerEntries.map(([, amount]) => typeof amount === 'number' ? amount : 0),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    };

    // Update most sold products chart
    const productEntries = Object.entries(report.mostSoldProducts)
      .sort(([, a], [, b]) => {
        const aVal = typeof a === 'number' ? a : 0;
        const bVal = typeof b === 'number' ? b : 0;
        return bVal - aVal;
      })
      .slice(0, 10);

    this.productChartData = {
      labels: productEntries.map(([product]) => product),
      datasets: [{
        label: this.translocoService.translate('sales.dashboard.salesAmount'),
        data: productEntries.map(([, amount]) => typeof amount === 'number' ? amount : 0),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
  }

}
