import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
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

import { DashboardComponent } from './dashboard.component';
import { SummaryCardsComponent } from '../summary-cards/summary-cards.component';
import { SalesDataService } from '../../services/sales-data.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let salesDataService: jasmine.SpyObj<SalesDataService>;

  beforeEach(async () => {
    const salesDataServiceSpy = jasmine.createSpyObj('SalesDataService', [
      'getDashboardSummary',
      'getChartDataByCompany',
      'getChartDataByCustomer',
      'getChartDataByProduct'
    ]);

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
        { provide: SalesDataService, useValue: salesDataServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    salesDataService = TestBed.inject(SalesDataService) as jasmine.SpyObj<SalesDataService>;

    // Setup default spy returns
    salesDataService.getDashboardSummary.and.returnValue({
      totalSales: 100000,
      currentSellerSales: 25000,
      sellerName: 'Test User'
    });

    salesDataService.getChartDataByCompany.and.returnValue({
      labels: ['Company A', 'Company B'],
      data: [60000, 40000],
      colors: ['#3B82F6', '#10B981']
    });

    salesDataService.getChartDataByCustomer.and.returnValue({
      labels: ['Customer 1', 'Customer 2'],
      data: [30000, 70000]
    });

    salesDataService.getChartDataByProduct.and.returnValue({
      labels: ['Product X', 'Product Y'],
      data: [45000, 55000]
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default date range', () => {
    expect(component.startDate).toBeTruthy();
    expect(component.endDate).toBeTruthy();
    
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    expect(component.endDate!.toDateString()).toBe(today.toDateString());
    expect(component.startDate!.toDateString()).toBe(ninetyDaysAgo.toDateString());
  });

  it('should load dashboard data on init', () => {
    expect(salesDataService.getDashboardSummary).toHaveBeenCalled();
    expect(salesDataService.getChartDataByCompany).toHaveBeenCalled();
    expect(salesDataService.getChartDataByCustomer).toHaveBeenCalled();
    expect(salesDataService.getChartDataByProduct).toHaveBeenCalled();
  });

  it('should display summary cards component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const summaryCardsComponent = compiled.querySelector('app-summary-cards');
    expect(summaryCardsComponent).toBeTruthy();
  });

  it('should pass summary data to summary cards component', () => {
    const summaryCardsComponent = fixture.debugElement.query(
      (element) => element.componentInstance instanceof SummaryCardsComponent
    );
    
    expect(summaryCardsComponent).toBeTruthy();
    expect(summaryCardsComponent.componentInstance.summary).toEqual({
      totalSales: 100000,
      currentSellerSales: 25000,
      sellerName: 'Test User'
    });
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
    salesDataService.getDashboardSummary.calls.reset();
    salesDataService.getChartDataByCompany.calls.reset();
    salesDataService.getChartDataByCustomer.calls.reset();
    salesDataService.getChartDataByProduct.calls.reset();

    component.onApplyFilters();

    expect(salesDataService.getDashboardSummary).toHaveBeenCalled();
    expect(salesDataService.getChartDataByCompany).toHaveBeenCalled();
    expect(salesDataService.getChartDataByCustomer).toHaveBeenCalled();
    expect(salesDataService.getChartDataByProduct).toHaveBeenCalled();
  });

  it('should clear filters when onClearFilters is called', () => {
    component.startDate = new Date();
    component.endDate = new Date();

    component.onClearFilters();

    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should update chart data based on service responses', () => {
    expect(component.companyChartData.labels).toEqual(['Company A', 'Company B']);
    expect(component.companyChartData.datasets[0].data).toEqual([60000, 40000]);
    
    expect(component.customerChartData.labels).toEqual(['Customer 1', 'Customer 2']);
    expect(component.customerChartData.datasets[0].data).toEqual([30000, 70000]);
    
    expect(component.productChartData.labels).toEqual(['Product X', 'Product Y']);
    expect(component.productChartData.datasets[0].data).toEqual([45000, 55000]);
  });
});
