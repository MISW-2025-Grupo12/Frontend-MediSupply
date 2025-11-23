import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { RouteDetail } from './route-detail';
import { LogisticStore } from '../../state/logistic.store';
import { Route as LogisticRoute } from '../../../../shared/models/route.model';
import { Delivery } from '../../../../shared/models/delivery.model';
import { RouteComputationService } from '../../../../core/services/route-computation.service';
import { GoogleMapsLoaderService } from '../../../../core/services/google-maps-loader.service';
import { Location } from '../../../../shared/models/location.model';
import { environment } from '../../../../../environments/environment';

class LogisticStoreStub {
  private readonly routesData: LogisticRoute[] = [
    {
      id: '1',
      date: '2024-05-10T00:00:00Z',
      driverId: 'driver-1',
      warehouse: {
        id: 'wh-1',
        name: 'Main Warehouse',
        address: '123 Warehouse St',
        location: {
          latitude: 4.711,
          longitude: -74.072
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      deliveries: [
        {
          id: 'delivery-1',
          address: 'Customer Avenue 100',
          deliveryDate: '2024-05-10T08:00:00Z',
          order: {
            id: 'order-1',
            total: 100,
            status: 'pending',
            confirmationDate: '2024-05-08T12:00:00Z',
            sellerId: 'seller-1',
            customer: {
              name: 'John Doe',
              phone: '3001234567',
              address: 'Customer Avenue 100',
              avatar: ''
            },
            products: []
          },
          location: undefined
        },
        {
          id: 'delivery-2',
          address: 'Customer Avenue 200',
          deliveryDate: '2024-05-10T10:00:00Z',
          order: {
            id: 'order-2',
            total: 150,
            status: 'pending',
            confirmationDate: '2024-05-08T12:00:00Z',
            sellerId: 'seller-2',
            customer: {
              name: 'Jane Smith',
              phone: '3001234568',
              address: 'Customer Avenue 200',
              avatar: ''
            },
            products: []
          },
          location: undefined
        }
      ]
    }
  ];

  routes = (): LogisticRoute[] => this.routesData;
  routesLoading = (): boolean => false;
  error = (): string | null => null;
  deliveries = (): Delivery[] => this.routesData[0]?.deliveries ?? [];
  loadRoutes = jasmine.createSpy('loadRoutes');
  updateDeliveryLocation = jasmine.createSpy('updateDeliveryLocation');
  updateWarehouseLocation = jasmine.createSpy('updateWarehouseLocation');
}

class RouteComputationServiceStub {
  ensureDeliveryLocation = (_apiKey: string, delivery: Delivery): Promise<Location | null> =>
    Promise.resolve({
      latitude: typeof delivery.id === 'string' && delivery.id.endsWith('1') ? 4.712 : 4.713,
      longitude: typeof delivery.id === 'string' && delivery.id.endsWith('1') ? -74.071 : -74.07
    });
}

class GoogleMapsLoaderServiceStub {
  load = () =>
    Promise.resolve({
      maps: {} as google.maps.MapsLibrary
    });

  computeRouteWithWaypoints = (_apiKey: string, waypoints: Location[]) =>
    Promise.resolve({
      path: waypoints.map((location) => ({ lat: location.latitude, lng: location.longitude }))
    });

  geocodeAddress = () =>
    Promise.resolve<google.maps.LatLngLiteral | null>({
      lat: 4.711,
      lng: -74.072
    });
}

describe('RouteDetail', () => {
  let component: RouteDetail;
  let fixture: ComponentFixture<RouteDetail>;
  const originalGoogleMapsKey = environment.googleMapsApiKey;

  beforeEach(async () => {
    environment.googleMapsApiKey = '';

    await TestBed.configureTestingModule({
      imports: [
        RouteDetail,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              common: {
                back: 'Back'
              },
              logistic: {
                routeDetail: {
                  loading: 'Loading route details...',
                  notFound: 'Route not found.',
                  error: 'Unable to load route.',
                  header: {
                    title: 'Route #{{ id }}',
                    subtitle: 'Scheduled for {{ date }}',
                    defaultTitle: 'Route detail'
                  },
                  summary: {
                    title: 'Route overview',
                    description: 'Route description',
                    routeId: 'Route',
                    date: 'Date',
                    driver: 'Driver',
                    warehouse: 'Warehouse',
                    deliveries: 'Deliveries'
                  },
                  map: {
                    title: 'Route map',
                    description: 'Map description',
                    computing: 'Computing...',
                    missingKey: 'Missing key',
                    loading: 'Loading map...',
                    empty: 'No deliveries',
                    missingWarehouseLocation: 'Missing warehouse location',
                    missingLocations: 'Missing delivery locations',
                    partialLocations: 'Partial locations',
                    unableToBuildPath: 'Unable to build path'
                  },
                  deliveries: {
                    title: 'Deliveries',
                    description: 'This route includes {{ count }} deliveries.',
                    empty: 'No deliveries assigned.',
                    address: 'Address',
                    deliveryDate: 'Delivery date',
                    orderId: 'Order',
                    customer: 'Customer',
                    products: '{{ count }} items'
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
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LogisticStore, useClass: LogisticStoreStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        },
        { provide: RouteComputationService, useClass: RouteComputationServiceStub },
        { provide: GoogleMapsLoaderService, useClass: GoogleMapsLoaderServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RouteDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    environment.googleMapsApiKey = originalGoogleMapsKey;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render route summary information', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.route-summary-card__item dd')?.textContent).toContain('#1');
    expect(compiled.querySelector('.route-summary-card__item:last-child dd')?.textContent).toContain('2');
  });
});
