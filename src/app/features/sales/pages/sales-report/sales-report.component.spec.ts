import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesReportComponent } from './sales-report.component';

describe('SalesReportComponent', () => {
  let component: SalesReportComponent;
  let fixture: ComponentFixture<SalesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SalesReportComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              sales: {
                report: {
                  title: 'Sales Report',
                  period: 'Period',
                  total: 'Total'
                }
              }
            },
            es: {
              sales: {
                report: {
                  title: 'Reporte de Ventas',
                  period: 'Período',
                  total: 'Total'
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
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
