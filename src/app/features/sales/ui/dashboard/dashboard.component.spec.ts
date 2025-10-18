import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { SummaryCardsComponent } from '../summary-cards/summary-cards.component';
import { SalesState } from '../../state/sales.store';
import { SalesDataService } from '../../services/sales-data.service';
import { SalesReport } from '../../../../shared/models/salesReport.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let salesState: jasmine.SpyObj<SalesState>;
  let salesDataService: jasmine.SpyObj<SalesDataService>;

  const mockSalesReport: SalesReport = {
    totalSales: 100000,
    totalProductsSold: 1250,
    salesByMonth: {
      'January': 30000,
      'February': 40000,
      'March': 30000
    },
    salesByCustomer: [
      { customerId: '1', name: 'Hospital Central', totalOrders: 5, totalAmount: 50000 },
      { customerId: '2', name: 'Clinic Norte', totalOrders: 3, totalAmount: 30000 },
      { customerId: '3', name: 'Farmacia Popular', totalOrders: 2, totalAmount: 20000 }
    ],
    mostSoldProducts: [
      { productId: '1', name: 'Surgical Masks', quantity: 500 },
      { productId: '2', name: 'Antibiotics', quantity: 300 },
      { productId: '3', name: 'Syringes', quantity: 450 }
    ]
  };

  beforeEach(async () => {
    const salesStateSpy = jasmine.createSpyObj('SalesState', ['loadSalesReport']);
    const salesDataServiceSpy = jasmine.createSpyObj('SalesDataService', ['getSalesReportData']);

    // Mock the salesReport computed signal
    Object.defineProperty(salesStateSpy, 'salesReport', {
      get: () => () => mockSalesReport,
      configurable: true
    });

    // Mock the getSalesReportData method
    salesDataServiceSpy.getSalesReportData.and.returnValue(of(mockSalesReport));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        SummaryCardsComponent,
        NoopAnimationsModule,
        FormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatNativeDateModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'sales.dashboard.title': 'Sales Dashboard',
              'sales.dashboard.filters.title': 'Filters',
              'sales.dashboard.filters.startDate': 'Start Date',
              'sales.dashboard.filters.endDate': 'End Date',
              'sales.dashboard.filters.apply': 'Apply',
              'sales.dashboard.filters.clear': 'Clear',
              'sales.dashboard.charts.salesByCompany': 'Sales by Company',
              'sales.dashboard.charts.salesByCustomer': 'Sales by Customer',
              'sales.dashboard.charts.salesByProduct': 'Sales by Product',
              'sales.dashboard.salesAmount': 'Sales Amount'
            }
          },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SalesState, useValue: salesStateSpy },
        { provide: SalesDataService, useValue: salesDataServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    salesState = TestBed.inject(SalesState) as jasmine.SpyObj<SalesState>;
    salesDataService = TestBed.inject(SalesDataService) as jasmine.SpyObj<SalesDataService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty date filters', () => {
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should load sales report data on init', () => {
    expect(salesState.loadSalesReport).toHaveBeenCalled();
  });

  it('should display summary cards component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const summaryCardsComponent = compiled.querySelector('app-summary-cards');
    expect(summaryCardsComponent).toBeTruthy();
  });

  it('should pass sales report data to summary cards component', () => {
    const summaryCardsComponent = fixture.debugElement.query(
      (element) => element.componentInstance instanceof SummaryCardsComponent
    );
    
    expect(summaryCardsComponent).toBeTruthy();
    expect(summaryCardsComponent.componentInstance.summary).toEqual(mockSalesReport);
  });

  it('should render filter controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const filtersCard = compiled.querySelector('.filters-card');
    expect(filtersCard).toBeTruthy();
    
    const dateFields = compiled.querySelectorAll('.date-field');
    expect(dateFields.length).toBe(2);
    
    const buttons = compiled.querySelectorAll('.filter-actions button');
    expect(buttons.length).toBe(2);
  });

  it('should render chart sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const chartsSection = compiled.querySelector('.charts-section');
    expect(chartsSection).toBeTruthy();
    
    const chartCards = compiled.querySelectorAll('.chart-card');
    expect(chartCards.length).toBe(3);
  });

  it('should apply filters when onApplyFilters is called', () => {
    salesState.loadSalesReport.calls.reset();

    component.onApplyFilters();

    expect(salesState.loadSalesReport).toHaveBeenCalled();
  });

  it('should clear filters when onClearFilters is called', () => {
    component.startDate = new Date();
    component.endDate = new Date();

    component.onClearFilters();

    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should update chart data based on sales report', () => {
    expect(component.companyChartData.labels).toEqual(['January', 'February', 'March']);
    expect(component.companyChartData.datasets[0].data).toEqual([30000, 40000, 30000]);
    
    expect(component.customerChartData.labels).toEqual(['Hospital Central', 'Clinic Norte', 'Farmacia Popular']);
    expect(component.customerChartData.datasets[0].data).toEqual([50000, 30000, 20000]);
    
    expect(component.productChartData.labels).toEqual(['Surgical Masks', 'Syringes', 'Antibiotics']);
    expect(component.productChartData.datasets[0].data).toEqual([500, 450, 300]);
  });
});
