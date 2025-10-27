import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { CreateSalesPlanForm } from './create-sales-plan-form';
import { SalesState } from '../../state/sales.store';
import { SalesDataService } from '../../services/sales-data.service';
import { AppStore } from '../../../../core/state/app.store';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

describe('CreateSalesPlanForm', () => {
  let component: CreateSalesPlanForm;
  let fixture: ComponentFixture<CreateSalesPlanForm>;

  beforeEach(async () => {
    const mockSalesDataService = jasmine.createSpyObj('SalesDataService', ['getCustomers']);
    mockSalesDataService.getCustomers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CreateSalesPlanForm,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        FormBuilder,
        SalesState,
        AppStore,
        { provide: SalesDataService, useValue: mockSalesDataService },
        { provide: LocaleRouteService, useValue: jasmine.createSpyObj('LocaleRouteService', ['navigateToRoute']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlanForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
