import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SummaryCardsComponent } from './summary-cards.component';
import { SalesReport } from '../../../../shared/models/salesReport.model';

describe('SummaryCardsComponent', () => {
  let component: SummaryCardsComponent;
  let fixture: ComponentFixture<SummaryCardsComponent>;

  const mockSummary: SalesReport = {
    totalSales: 150000,
    totalProductsSold: 1250,
    salesByMonth: {
      'January': 50000,
      'February': 60000,
      'March': 40000
    },
    salesByCustomer: [
      { customerId: '1', name: 'Hospital Central', totalOrders: 5, totalAmount: 75000 },
      { customerId: '2', name: 'Clinic Norte', totalOrders: 3, totalAmount: 45000 },
      { customerId: '3', name: 'Farmacia Popular', totalOrders: 2, totalAmount: 30000 }
    ],
    mostSoldProducts: [
      { productId: '1', name: 'Surgical Masks', quantity: 500 },
      { productId: '2', name: 'Antibiotics', quantity: 100 },
      { productId: '3', name: 'Syringes', quantity: 200 }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SummaryCardsComponent,
        MatCardModule,
        MatIconModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'sales.dashboard.summary.totalSales': 'Total Sales',
              'sales.dashboard.summary.myTotalSales': 'My Total Sales'
            },
            es: {
              'sales.dashboard.summary.totalSales': 'Ventas Totales',
              'sales.dashboard.summary.myTotalSales': 'Mis Ventas Totales'
            }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryCardsComponent);
    component = fixture.componentInstance;
    component.summary = mockSummary;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct summary data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check if the formatted currency values are displayed
    const summaryValues = compiled.querySelectorAll('.summary-value');
    expect(summaryValues.length).toBe(2);
    
    // Check total sales value
    expect(summaryValues[0].textContent?.trim()).toBe('$150,000.00');
    
    // Check total products sold value
    expect(summaryValues[1].textContent?.trim()).toBe('1,250');
  });

  it('should render the correct icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = compiled.querySelectorAll('mat-icon');
    
    expect(icons.length).toBe(2);
    expect(icons[0].textContent?.trim()).toBe('attach_money');
    expect(icons[1].textContent?.trim()).toBe('inventory');
  });

  it('should have the correct CSS classes for styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check summary section exists
    const summarySection = compiled.querySelector('.summary-section');
    expect(summarySection).toBeTruthy();
    
    // Check summary cards container exists
    const summaryCards = compiled.querySelector('.summary-cards');
    expect(summaryCards).toBeTruthy();
    
    // Check individual cards
    const summaryCardElements = compiled.querySelectorAll('.summary-card');
    expect(summaryCardElements.length).toBe(2);
    
    // Check icon classes
    const totalSalesIcon = compiled.querySelector('.summary-icon.total-sales');
    const sellerSalesIcon = compiled.querySelector('.summary-icon.seller-sales');
    expect(totalSalesIcon).toBeTruthy();
    expect(sellerSalesIcon).toBeTruthy();
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(0)).toBe('$0.00');
    expect(component.formatCurrency(1000)).toBe('$1,000.00');
    expect(component.formatCurrency(1234.56)).toBe('$1,234.56');
    expect(component.formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should handle zero values gracefully', async () => {
    // Update the input using componentRef.setInput for proper change detection
    fixture.componentRef.setInput('summary', {
      totalSales: 0,
      totalProductsSold: 0,
      salesByMonth: {},
      salesByCustomer: [],
      mostSoldProducts: []
    });
    
    // Wait for change detection to complete
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summaryValues = compiled.querySelectorAll('.summary-value');
    
    expect(summaryValues[0].textContent?.trim()).toBe('$0.00');
    expect(summaryValues[1].textContent?.trim()).toBe('0');
  });

  it('should handle negative values correctly', async () => {
    // Update the input using componentRef.setInput for proper change detection
    fixture.componentRef.setInput('summary', {
      totalSales: -500,
      totalProductsSold: 0,
      salesByMonth: {},
      salesByCustomer: [],
      mostSoldProducts: []
    });
    
    // Wait for change detection to complete
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summaryValues = compiled.querySelectorAll('.summary-value');
    
    expect(summaryValues[0].textContent?.trim()).toBe('-$500.00');
    expect(summaryValues[1].textContent?.trim()).toBe('0');
  });

  it('should update display when summary input changes', async () => {
    const newSummary: SalesReport = {
      totalSales: 200000,
      totalProductsSold: 2000,
      salesByMonth: {
        'April': 80000,
        'May': 120000
      },
      salesByCustomer: [
        { customerId: '1', name: 'Hospital Central', totalOrders: 5, totalAmount: 100000 },
        { customerId: '2', name: 'Clinic Norte', totalOrders: 3, totalAmount: 100000 }
      ],
      mostSoldProducts: [
        { productId: '1', name: 'Surgical Masks', quantity: 1000 },
        { productId: '2', name: 'Antibiotics', quantity: 1000 }
      ]
    };

    // Update the input using componentRef.setInput for proper change detection
    fixture.componentRef.setInput('summary', newSummary);
    
    // Wait for change detection to complete
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summaryValues = compiled.querySelectorAll('.summary-value');
    
    expect(summaryValues[0].textContent?.trim()).toBe('$200,000.00');
    expect(summaryValues[1].textContent?.trim()).toBe('2,000');
  });
});
