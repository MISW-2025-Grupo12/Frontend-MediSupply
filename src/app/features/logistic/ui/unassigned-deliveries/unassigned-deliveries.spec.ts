import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { UnassignedDeliveries } from './unassigned-deliveries';
import { Delivery } from '../../../../shared/models/delivery.model';

describe('UnassignedDeliveries', () => {
  let component: UnassignedDeliveries;
  let fixture: ComponentFixture<UnassignedDeliveries>;

  const mockDeliveries: Delivery[] = [
    {
      id: 'DEL-1',
      address: 'Main St 123',
      deliveryDate: '2025-11-15T09:00:00Z',
      order: {
        id: 'PED-1',
        total: 150000,
        status: 'CONFIRMADO',
        confirmationDate: '2025-11-10T09:30:00Z',
        sellerId: 'VEN-1',
        customer: {
          name: 'Clinic Example',
          phone: '+57 1 5550000',
          address: 'Main St 123',
          avatar: ''
        },
        products: []
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnassignedDeliveries,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              logistic: {
                states: {
                  loading: 'Loading',
                  error: 'Error'
                },
                unassigned: {
                  title: 'Deliveries awaiting assignment',
                  subtitle: 'Subtitle',
                  count: '{{ count }} pending',
                  empty: 'Empty state',
                  sectionTitle: '',
                  sectionDescription: '',
                  labels: {
                    deliveryId: 'Delivery ID',
                    deliveryAddress: 'Delivery address',
                    deliveryDate: 'Delivery date',
                    orderId: 'Order ID',
                    orderTotal: 'Order total',
                    customer: 'Customer',
                    customerPhone: 'Phone number',
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
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnassignedDeliveries);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('deliveries', mockDeliveries);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render delivery information', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const deliveryAddress = compiled.querySelector('.delivery-card__value');
    expect(deliveryAddress?.textContent).toContain('Main St 123');
  });
});
