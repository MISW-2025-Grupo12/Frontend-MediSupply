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
                actions: {
                  addToRoute: 'Add to route',
                  removeFromRoute: 'Remove from route'
                },
                unassigned: {
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
                    pendiente: 'Pending',
                    en_ruta: 'In transit',
                    entregado: 'Delivered',
                    preparando: 'Preparing',
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
