import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Dashboard } from './dashboard';
import { DashboardState } from '../../../state/dashboard.state';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardStateSpy: jasmine.SpyObj<DashboardState>;

  beforeEach(async () => {
    dashboardStateSpy = jasmine.createSpyObj('DashboardState', [
      'refreshDashboard',
      'navigateToFeature',
      'logout'
    ], {
      // Mock computed signals as properties
      userName: jasmine.createSpy().and.returnValue('Test User'),
      isLoading: jasmine.createSpy().and.returnValue(false),
      availableFeatures: jasmine.createSpy().and.returnValue([
        {
          id: 'products',
          titleKey: 'dashboard.cards.products.title',
          descriptionKey: 'dashboard.cards.products.description',
          icon: 'inventory_2',
          route: 'products',
          color: '#646116',
          enabled: true
        }
      ])
    });

    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: { 
            en: { 
              dashboard: { 
                title: 'Dashboard',
                welcome: 'Welcome',
                subtitle: 'Manage your medical supplies efficiently',
                logout: 'Logout',
                loading: 'Loading...',
                comingSoon: 'Coming Soon',
                clickToOpen: 'Click to open',
                cards: {
                  products: {
                    title: 'Products',
                    description: 'Manage your medical products'
                  }
                }
              } 
            },
            es: { 
              dashboard: { 
                title: 'Panel',
                welcome: 'Bienvenido',
                subtitle: 'Gestiona tus suministros médicos eficientemente',
                logout: 'Cerrar sesión',
                loading: 'Cargando...',
                comingSoon: 'Próximamente',
                clickToOpen: 'Hacer clic para abrir',
                cards: {
                  products: {
                    title: 'Productos',
                    description: 'Gestiona tus productos médicos'
                  }
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
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DashboardState, useValue: dashboardStateSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call refreshDashboard on init', () => {
    expect(dashboardStateSpy.refreshDashboard).toHaveBeenCalled();
  });

  it('should call navigateToFeature when card is clicked', () => {
    const mockCard = {
      id: 'products',
      titleKey: 'dashboard.cards.products.title',
      descriptionKey: 'dashboard.cards.products.description',
      icon: 'inventory_2',
      route: 'products',
      color: '#646116',
      enabled: true
    };

    component.onCardClick(mockCard);
    
    expect(dashboardStateSpy.navigateToFeature).toHaveBeenCalledWith(mockCard);
  });

  it('should call logout when logout is clicked', () => {
    component.onLogout();
    
    expect(dashboardStateSpy.logout).toHaveBeenCalled();
  });

  it('should display user name', () => {
    expect(dashboardStateSpy.userName).toHaveBeenCalled();
  });

  it('should check loading state', () => {
    expect(dashboardStateSpy.isLoading).toHaveBeenCalled();
  });
});
