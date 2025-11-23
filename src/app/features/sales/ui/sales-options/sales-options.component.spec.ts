import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesOptionsComponent } from './sales-options.component';
import { TEST_ROUTES } from '../../../../core/testing/test-routes';
import { AppStore } from '../../../../core/state/app.store';
import { AppUser } from '../../../../shared/models/user.model';
import { UserType } from '../../../../shared/enums/user-type';

describe('SalesOptionsComponent', () => {
  let component: SalesOptionsComponent;
  let fixture: ComponentFixture<SalesOptionsComponent>;
  let mockAppStore: jasmine.SpyObj<AppStore>;

  beforeEach(async () => {
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
        SalesOptionsComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              sales: {
                options: {
                  dashboard: 'Dashboard',
                  reports: 'Reports'
                }
              }
            },
            es: {
              sales: {
                options: {
                  dashboard: 'Panel',
                  reports: 'Reportes'
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
        provideRouter(TEST_ROUTES),
        {
          provide: AppStore,
          useValue: mockAppStore
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
