import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { CustomerVisitsReport } from './customer-visits-report';

describe('CustomerVisitsReport', () => {
  let component: CustomerVisitsReport;
  let fixture: ComponentFixture<CustomerVisitsReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CustomerVisitsReport,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerVisitsReport);
    component = fixture.componentInstance;
    // Set required input
    fixture.componentRef.setInput('visits', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
