import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesPlanComponent } from './sales-plan';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';
import { AppStore } from '../../../../core/state/app.store';
import { AppUser } from '../../../../shared/models/user.model';
import { UserType } from '../../../../shared/enums/user-type';

describe('SalesPlanComponent', () => {
  let component: SalesPlanComponent;
  let fixture: ComponentFixture<SalesPlanComponent>;
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSalesState: jasmine.SpyObj<SalesState>;
  let mockAppStore: jasmine.SpyObj<AppStore>;

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

    mockAppStore = jasmine.createSpyObj('AppStore', ['user']);
    const adminUser: AppUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      legalId: '12345678',
      phone: '1234567890',
      address: 'Test Address',
      role: UserType.ADMIN
    };
    mockAppStore.user.and.returnValue(adminUser);

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
        },
        {
          provide: AppStore,
          useValue: mockAppStore
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

  it('should return true for isAdmin when user is admin', () => {
    expect(component.isAdmin()).toBeTrue();
  });

  it('should return false for isAdmin when user is not admin', () => {
    const nonAdminUser: AppUser = {
      id: '2',
      name: 'Seller User',
      email: 'seller@test.com',
      legalId: '87654321',
      phone: '0987654321',
      address: 'Test Address',
      role: UserType.SELLER
    };
    mockAppStore.user.and.returnValue(nonAdminUser);
    
    expect(component.isAdmin()).toBeFalse();
  });

  it('should return false for isAdmin when no user is logged in', () => {
    mockAppStore.user.and.returnValue(null);
    
    expect(component.isAdmin()).toBeFalse();
  });
});
