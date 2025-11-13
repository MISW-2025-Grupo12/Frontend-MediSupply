import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { provideRouter } from '@angular/router';

import { LogisticPage } from './logistic-page';

describe('LogisticPage', () => {
  let component: LogisticPage;
  let fixture: ComponentFixture<LogisticPage>;

  beforeEach(async () => {
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
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogisticPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
