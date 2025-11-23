import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SelectedDeliveries } from './selected-deliveries';

describe('SelectedDeliveries', () => {
  let component: SelectedDeliveries;
  let fixture: ComponentFixture<SelectedDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectedDeliveries,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              logistic: {
                addRoute: {
                  selectedDeliveries: 'Selected deliveries',
                  selectedCount: 'Selected: {{ count }}',
                  noDeliveriesSelected: 'No deliveries selected'
                },
                actions: {
                  removeFromRoute: 'Remove'
                },
                unassigned: {
                  labels: {
                    deliveryAddress: 'Address',
                    deliveryDate: 'Delivery date',
                    orderTotal: 'Order total',
                    customer: 'Customer'
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
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
