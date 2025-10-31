import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesPlanComponent } from './sales-plan';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';

describe('SalesPlanComponent', () => {
  let component: SalesPlanComponent;
  let fixture: ComponentFixture<SalesPlanComponent>;
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSalesState: jasmine.SpyObj<SalesState>;

  beforeEach(async () => {
    // Create spy objects
    mockLocaleRouteService = jasmine.createSpyObj('LocaleRouteService', ['navigateToNestedRoute', 'getCurrentLocale']);
    mockLocaleRouteService.getCurrentLocale.and.returnValue('en');
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockSalesState = jasmine.createSpyObj('SalesState', ['loadSalesPlans']);
    // Mock the salesPlans computed signal
    Object.defineProperty(mockSalesState, 'salesPlans', {
      get: () => () => [],
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        SalesPlanComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LocaleRouteService,
          useValue: mockLocaleRouteService
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: SalesState,
          useValue: mockSalesState
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadSalesPlans on init', () => {
    expect(mockSalesState.loadSalesPlans).toHaveBeenCalled();
  });

  it('should navigate to add sales plan', () => {
    component.navigateToAddSalesPlan();
    expect(mockLocaleRouteService.navigateToNestedRoute).toHaveBeenCalledWith(['sales', 'addSalesPlan']);
  });

  it('should navigate to sales plan detail with id', () => {
    const planId = '123';
    component.navigateToSalesPlanDetail(planId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['en', 'sales', 'sales-plan', '123']);
  });

  it('should navigate to sales plan detail with Spanish locale', () => {
    mockLocaleRouteService.getCurrentLocale.and.returnValue('es');
    const planId = '456';
    component.navigateToSalesPlanDetail(planId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['es', 'ventas', 'plan-de-ventas', '456']);
  });

  it('should calculate total visits correctly', () => {
    const mockSalesPlan = {
      id: '1',
      customerVisits: [
        { visits: [{ id: '1' }, { id: '2' }] },
        { visits: [{ id: '3' }] }
      ]
    } as any;
    
    const total = component.getTotalVisits(mockSalesPlan);
    expect(total).toBe(3);
  });

  it('should return 0 for total visits when customerVisits is empty', () => {
    const mockSalesPlan = {
      id: '1',
      customerVisits: []
    } as any;
    
    const total = component.getTotalVisits(mockSalesPlan);
    expect(total).toBe(0);
  });

  it('should return 0 for total visits when customerVisits is undefined', () => {
    const mockSalesPlan = {
      id: '1'
    } as any;
    
    const total = component.getTotalVisits(mockSalesPlan);
    expect(total).toBe(0);
  });

  it('should calculate total customers correctly', () => {
    const mockSalesPlan = {
      id: '1',
      customerVisits: [
        { customer: { id: '1' } },
        { customer: { id: '2' } },
        { customer: { id: '3' } }
      ]
    } as any;
    
    const total = component.getTotalCustomers(mockSalesPlan);
    expect(total).toBe(3);
  });

  it('should return 0 for total customers when customerVisits is empty', () => {
    const mockSalesPlan = {
      id: '1',
      customerVisits: []
    } as any;
    
    const total = component.getTotalCustomers(mockSalesPlan);
    expect(total).toBe(0);
  });

  it('should return 0 for total customers when customerVisits is undefined', () => {
    const mockSalesPlan = {
      id: '1'
    } as any;
    
    const total = component.getTotalCustomers(mockSalesPlan);
    expect(total).toBe(0);
  });
});
