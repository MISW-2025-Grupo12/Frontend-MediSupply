import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { SalesPlanComponent } from './sales-plan';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

describe('SalesPlanComponent', () => {
  let component: SalesPlanComponent;
  let fixture: ComponentFixture<SalesPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SalesPlanComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocaleRouteService,
          useValue: jasmine.createSpyObj('LocaleRouteService', ['navigateToNestedRoute'])
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
