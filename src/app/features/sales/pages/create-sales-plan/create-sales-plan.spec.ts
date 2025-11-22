import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { CreateSalesPlan } from './create-sales-plan';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { AppStore } from '../../../../core/state/app.store';
import { UsersStore } from '../../../users/state/users.store';
import { SalesState } from '../../state/sales.store';
import { AppUser } from '../../../../shared/models/user.model';
import { UserType } from '../../../../shared/enums/user-type';

describe('CreateSalesPlan', () => {
  let component: CreateSalesPlan;
  let fixture: ComponentFixture<CreateSalesPlan>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockUsersStore: jasmine.SpyObj<UsersStore>;
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
    mockLocaleRouteService = jasmine.createSpyObj('LocaleRouteService', ['navigateToNestedRoute', 'getCurrentLocale']);
    mockLocaleRouteService.getCurrentLocale.and.returnValue('en');

    mockUsersStore = jasmine.createSpyObj('UsersStore', ['loadSellerUsers']);
    Object.defineProperty(mockUsersStore, 'sellerUsers', {
      get: () => () => [],
      configurable: true
    });
    Object.defineProperty(mockUsersStore, 'isLoadingSellerUsers', {
      get: () => () => false,
      configurable: true
    });

    mockSalesState = jasmine.createSpyObj('SalesState', ['createSalesPlan', 'loadCustomers']);
    Object.defineProperty(mockSalesState, 'customers', {
      get: () => () => [],
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        CreateSalesPlan,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        FormBuilder,
        {
          provide: AppStore,
          useValue: mockAppStore
        },
        {
          provide: LocaleRouteService,
          useValue: mockLocaleRouteService
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: UsersStore,
          useValue: mockUsersStore
        },
        {
          provide: SalesState,
          useValue: mockSalesState
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load seller users on init for admin', () => {
    expect(mockUsersStore.loadSellerUsers).toHaveBeenCalled();
  });

  it('should redirect non-admin users to dashboard', () => {
    const nonAdminUser: AppUser = {
      ...adminUser,
      role: UserType.SELLER
    };
    mockAppStore.user.and.returnValue(nonAdminUser);

    const newFixture = TestBed.createComponent(CreateSalesPlan);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/en/dashboard']);
  });

  it('should redirect when no user is logged in', () => {
    mockAppStore.user.and.returnValue(null);

    const newFixture = TestBed.createComponent(CreateSalesPlan);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/en/dashboard']);
  });
});
