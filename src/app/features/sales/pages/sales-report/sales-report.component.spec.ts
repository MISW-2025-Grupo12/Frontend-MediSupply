import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesReportComponent } from './sales-report.component';
import { AppStore } from '../../../../core/state/app.store';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { SalesState } from '../../state/sales.store';
import { AppUser } from '../../../../shared/models/user.model';
import { UserType } from '../../../../shared/enums/user-type';

describe('SalesReportComponent', () => {
  let component: SalesReportComponent;
  let fixture: ComponentFixture<SalesReportComponent>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockSalesState: jasmine.SpyObj<SalesState>;
  let adminUser: AppUser;

  beforeEach(async () => {
    adminUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      legalId: '12345678',
      phone: '1234567890',
      address: 'Test Address',
      role: UserType.ADMIN
    };

    mockAppStore = jasmine.createSpyObj('AppStore', ['user']);
    mockAppStore.user.and.returnValue(adminUser);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockLocaleRouteService = jasmine.createSpyObj('LocaleRouteService', ['getCurrentLocale']);
    mockLocaleRouteService.getCurrentLocale.and.returnValue('en');

    mockSalesState = jasmine.createSpyObj('SalesState', ['loadReportCustomerVisits', 'isLoading', 'reportCustomerVisits']);
    Object.defineProperty(mockSalesState, 'isLoading', {
      get: () => () => false,
      configurable: true
    });
    Object.defineProperty(mockSalesState, 'reportCustomerVisits', {
      get: () => () => [],
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        SalesReportComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              sales: {
                report: {
                  title: 'Sales Report',
                  period: 'Period',
                  total: 'Total'
                }
              }
            },
            es: {
              sales: {
                report: {
                  title: 'Reporte de Ventas',
                  period: 'Período',
                  total: 'Total'
                }
              }
            }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AppStore,
          useValue: mockAppStore
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: LocaleRouteService,
          useValue: mockLocaleRouteService
        },
        {
          provide: SalesState,
          useValue: mockSalesState
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin users to dashboard', () => {
    const nonAdminUser: AppUser = {
      ...adminUser,
      role: UserType.SELLER
    };
    mockAppStore.user.and.returnValue(nonAdminUser);

    const newFixture = TestBed.createComponent(SalesReportComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/en/dashboard']);
  });

  it('should redirect when no user is logged in', () => {
    mockAppStore.user.and.returnValue(null);

    const newFixture = TestBed.createComponent(SalesReportComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/en/dashboard']);
  });
});
