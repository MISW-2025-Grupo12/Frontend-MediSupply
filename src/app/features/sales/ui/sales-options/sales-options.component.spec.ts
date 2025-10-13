import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesOptionsComponent } from './sales-options.component';

describe('SalesOptionsComponent', () => {
  let component: SalesOptionsComponent;
  let fixture: ComponentFixture<SalesOptionsComponent>;

  beforeEach(async () => {
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
        provideRouter([])
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
});
