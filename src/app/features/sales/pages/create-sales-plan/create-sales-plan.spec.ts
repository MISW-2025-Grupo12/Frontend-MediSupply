import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { CreateSalesPlan } from './create-sales-plan';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

describe('CreateSalesPlan', () => {
  let component: CreateSalesPlan;
  let fixture: ComponentFixture<CreateSalesPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateSalesPlan,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        {
          provide: LocaleRouteService,
          useValue: jasmine.createSpyObj('LocaleRouteService', ['navigateToNestedRoute'])
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
