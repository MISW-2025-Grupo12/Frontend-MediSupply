import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, computed } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { provideRouter } from '@angular/router';
import { AppStore } from '../../../../core/state/app.store';
import { AppUser } from '../../../../shared/models/user.model';
import { UserType } from '../../../../shared/enums/user-type';

import { LogisticPage } from './logistic-page';

describe('LogisticPage', () => {
  let component: LogisticPage;
  let fixture: ComponentFixture<LogisticPage>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let userSignal: ReturnType<typeof signal<AppUser | null>>;

  beforeEach(async () => {
    userSignal = signal<AppUser | null>(null);
    const apiBusySignal = signal(false);
    const errorSignal = signal<string | null>(null);
    
    const appStoreSpy = jasmine.createSpyObj('AppStore', ['setApiBusy'], {
      apiBusy: apiBusySignal,
      error: errorSignal
    });
    
    // Set up user as a function that returns the signal value (matching computed signal behavior)
    appStoreSpy.user = jasmine.createSpy('user').and.callFake(() => userSignal());
    appStoreSpy.accessToken = jasmine.createSpy('accessToken').and.returnValue(null);
    appStoreSpy.isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        LogisticPage,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              logistic: {
                title: 'Logistics',
                actions: {
                  createRoute: 'Create route',
                  addToRoute: 'Add to route',
                  removeFromRoute: 'Remove from route'
                },
                routes: {
                  sectionTitle: 'Scheduled routes',
                  sectionDescription: 'Review the routes that were already created.',
                  loading: 'Loading routes...',
                  empty: 'No routes available.',
                  driver: 'Driver',
                  warehouse: 'Warehouse',
                  deliveries: 'Deliveries'
                },
                states: {
                  loading: 'Loading deliveries...',
                  error: 'We could not load the deliveries.'
                },
                unassigned: {
                  sectionTitle: 'Unassigned deliveries',
                  sectionDescription: 'Review pending deliveries before assigning them.',
                  title: 'Deliveries awaiting assignment',
                  subtitle: 'Subtitle',
                  count: '{{ count }} pending',
                  empty: 'Empty state',
                  labels: {
                    deliveryAddress: 'Delivery address',
                    deliveryDate: 'Delivery date',
                    orderTotal: 'Order total',
                    customer: 'Customer',
                    customerPhone: 'Customer phone',
                    items: 'Items'
                  },
                  status: {
                    borrador: 'Draft',
                    confirmado: 'Confirmed',
                    'en-transito': 'In transit',
                    entregado: 'Delivered',
                    unknown: 'Unknown'
                  }
                }
              }
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
        provideRouter([
          {
            path: ':locale',
            children: [
              { path: 'logistica', component: {} as any },
              { path: 'logistic', component: {} as any },
              { path: '**', component: {} as any }
            ]
          },
          { path: '**', component: {} as any }
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppStore, useValue: appStoreSpy }
      ]
    })
    .compileComponents();

    mockAppStore = TestBed.inject(AppStore) as jasmine.SpyObj<AppStore>;
    fixture = TestBed.createComponent(LogisticPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAdmin to false when user is not admin', () => {
    const nonAdminUser: AppUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      legalId: '12345678',
      phone: '+1234567890',
      address: 'Test Address',
      role: UserType.DELIVERY
    };
    userSignal.set(nonAdminUser);
    fixture.detectChanges();
    
    expect(component.isAdmin()).toBeFalse();
  });

  it('should set isAdmin to true when user is admin', () => {
    const adminUser: AppUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      legalId: '12345678',
      phone: '+1234567890',
      address: 'Test Address',
      role: UserType.ADMIN
    };
    userSignal.set(adminUser);
    fixture.detectChanges();
    
    expect(component.isAdmin()).toBeTrue();
  });

  it('should set isAdmin to false when no user is logged in', () => {
    userSignal.set(null);
    fixture.detectChanges();
    
    expect(component.isAdmin()).toBeFalse();
  });
});
