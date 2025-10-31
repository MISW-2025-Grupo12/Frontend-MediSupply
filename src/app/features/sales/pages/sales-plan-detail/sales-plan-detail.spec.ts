import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesPlanDetail } from './sales-plan-detail';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';
import { SalesPlan } from '../../../../shared/models/salesPlan.model';
import { CustomerVisit } from '../../../../shared/models/customerVisit.model';
import { AppUser } from '../../../../shared/models/user.model';

describe('SalesPlanDetail', () => {
  let component: SalesPlanDetail;
  let fixture: ComponentFixture<SalesPlanDetail>;
  let mockActivatedRoute: { params: any };
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockSalesState: jasmine.SpyObj<SalesState>;
  let paramsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    // Create params subject for ActivatedRoute
    paramsSubject = new BehaviorSubject({ id: '123' });
    mockActivatedRoute = {
      params: paramsSubject.asObservable()
    };

    // Create spy objects
    mockLocaleRouteService = jasmine.createSpyObj('LocaleRouteService', ['navigateToNestedRoute']);
    
    mockSalesState = jasmine.createSpyObj('SalesState', ['loadSalesPlans', 'loadCustomers']);
    
    // Mock the salesPlans computed signal
    const mockSalesPlans: SalesPlan[] = [
      {
        id: '123',
        name: 'Test Sales Plan',
        userId: '1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        customerVisits: [
          {
            id: '1',
            visits: [
              {
                id: 'v1',
                visitDate: new Date('2024-02-15T10:00:00'),
                address: '123 Main St',
                phone: '555-0100',
                status: 'pending'
              },
              {
                id: 'v2',
                visitDate: new Date('2024-02-15T14:00:00'),
                address: '123 Main St',
                phone: '555-0100',
                status: 'completed'
              }
            ]
          },
          {
            id: '2',
            visits: [
              {
                id: 'v3',
                visitDate: new Date('2024-02-16T10:00:00'),
                address: '456 Oak Ave',
                phone: '555-0200',
                status: 'cancelled'
              }
            ]
          }
        ]
      }
    ];

    const mockCustomers: AppUser[] = [
      { id: '1', name: 'Customer One', email: 'customer1@test.com', legalId: '123', phone: '555-0100', address: '123 Main St', role: 'CUSTOMER' as any },
      { id: '2', name: 'Customer Two', email: 'customer2@test.com', legalId: '456', phone: '555-0200', address: '456 Oak Ave', role: 'CUSTOMER' as any }
    ];

    Object.defineProperty(mockSalesState, 'salesPlans', {
      get: () => () => mockSalesPlans,
      configurable: true
    });

    Object.defineProperty(mockSalesState, 'customers', {
      get: () => () => mockCustomers,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        SalesPlanDetail,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: LocaleRouteService,
          useValue: mockLocaleRouteService
        },
        {
          provide: SalesState,
          useValue: mockSalesState
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPlanDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize salesPlanId from route params', (done) => {
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.salesPlanId()).toBe('123');
      done();
    }, 100);
  });

  it('should find sales plan by id from route params', (done) => {
    fixture.detectChanges();
    
    setTimeout(() => {
      const plan = component.salesPlan();
      expect(plan).toBeTruthy();
      expect(plan?.id).toBe('123');
      expect(plan?.name).toBe('Test Sales Plan');
      done();
    }, 100);
  });

  it('should return null for salesPlan when id is not found', (done) => {
    paramsSubject.next({ id: '999' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const plan = component.salesPlan();
      expect(plan).toBeNull();
      done();
    }, 100);
  });

  it('should load sales plans when plans are empty', (done) => {
    Object.defineProperty(mockSalesState, 'salesPlans', {
      get: () => () => [],
      configurable: true
    });
    
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(mockSalesState.loadSalesPlans).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should load customers when customers list is empty', (done) => {
    Object.defineProperty(mockSalesState, 'customers', {
      get: () => () => [],
      configurable: true
    });
    
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(mockSalesState.loadCustomers).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should group visits by day correctly', (done) => {
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const grouped = component.groupedVisits();
      expect(grouped.length).toBe(2); // Two different days
      expect(grouped[0].dateString).toBe('2024-02-15');
      expect(grouped[0].visits.length).toBe(2); // Two visits on Feb 15
      expect(grouped[1].dateString).toBe('2024-02-16');
      expect(grouped[1].visits.length).toBe(1); // One visit on Feb 16
      done();
    }, 100);
  });

  it('should include customer names in grouped visits', (done) => {
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const grouped = component.groupedVisits();
      expect(grouped[0].visits[0].customerName).toBe('Customer One');
      expect(grouped[0].visits[0].customerId).toBe('1');
      expect(grouped[1].visits[0].customerName).toBe('Customer Two');
      expect(grouped[1].visits[0].customerId).toBe('2');
      done();
    }, 100);
  });

  it('should return empty array when sales plan has no customer visits', (done) => {
    const emptyPlan: SalesPlan = {
      id: '456',
      name: 'Empty Plan',
      userId: '1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      customerVisits: []
    };
    
    Object.defineProperty(mockSalesState, 'salesPlans', {
      get: () => () => [emptyPlan],
      configurable: true
    });
    
    paramsSubject.next({ id: '456' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const grouped = component.groupedVisits();
      expect(grouped).toEqual([]);
      done();
    }, 100);
  });

  it('should return empty array when sales plan is null', (done) => {
    paramsSubject.next({ id: '999' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const grouped = component.groupedVisits();
      expect(grouped).toEqual([]);
      done();
    }, 100);
  });

  it('should return status-pending class for undefined status', () => {
    const statusClass = component.getVisitStatusClass();
    expect(statusClass).toBe('status-pending');
  });

  it('should return status-pending class for pending status', () => {
    const statusClass = component.getVisitStatusClass('pending');
    expect(statusClass).toBe('status-pending');
  });

  it('should return status-completed class for completed status', () => {
    const statusClass = component.getVisitStatusClass('completed');
    expect(statusClass).toBe('status-completed');
  });

  it('should return status-completed class for completada status', () => {
    const statusClass = component.getVisitStatusClass('completada');
    expect(statusClass).toBe('status-completed');
  });

  it('should return status-cancelled class for cancelled status', () => {
    const statusClass = component.getVisitStatusClass('cancelled');
    expect(statusClass).toBe('status-cancelled');
  });

  it('should return status-cancelled class for cancelada status', () => {
    const statusClass = component.getVisitStatusClass('cancelada');
    expect(statusClass).toBe('status-cancelled');
  });

  it('should navigate back to sales plan list', () => {
    component.navigateBack();
    expect(mockLocaleRouteService.navigateToNestedRoute).toHaveBeenCalledWith(['sales', 'salesPlan']);
  });

  it('should sort visits by date within grouped visits', (done) => {
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      const grouped = component.groupedVisits();
      const feb15Visits = grouped.find(g => g.dateString === '2024-02-15')?.visits || [];
      expect(feb15Visits.length).toBe(2);
      // First visit should be earlier than second
      expect(feb15Visits[0].visitDate.getTime()).toBeLessThan(feb15Visits[1].visitDate.getTime());
      done();
    }, 100);
  });

  it('should use fallback customer name when customer not found', (done) => {
    // Set up limited customers before triggering the component logic
    const limitedCustomers: AppUser[] = [
      { id: '2', name: 'Customer Two', email: 'customer2@test.com', legalId: '456', phone: '555-0200', address: '456 Oak Ave', role: 'CUSTOMER' as any }
    ];
    
    // Override the customers property getter to return limited customers
    Object.defineProperty(mockSalesState, 'customers', {
      get: () => () => limitedCustomers,
      configurable: true
    });
    
    // Reset component state and re-initialize
    component.salesPlanId.set(null);
    fixture.detectChanges();
    
    // Trigger ngOnInit behavior by emitting new params
    paramsSubject.next({ id: '123' });
    fixture.detectChanges();
    
    setTimeout(() => {
      // Force signal recalculation by accessing the computed
      const grouped = component.groupedVisits();
      expect(grouped.length).toBeGreaterThan(0);
      
      // Find visits from customer '1' which is not in the limited customers list
      const allVisits = grouped.flatMap(g => g.visits);
      const visitsFromMissingCustomer = allVisits.filter(v => v.customerId === '1');
      
      expect(visitsFromMissingCustomer.length).toBeGreaterThan(0);
      // Verify fallback name format matches: `Customer ${id}`
      const visit = visitsFromMissingCustomer[0];
      expect(visit.customerName).toBe('Customer 1');
      expect(visit.customerId).toBe('1');
      done();
    }, 200);
  });
});
