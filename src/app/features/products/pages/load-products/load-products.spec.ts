import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { of } from 'rxjs';

import { LoadProducts } from './load-products';
import { ProductsService } from '../../services/products.service';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import type { LoadFileJob } from '../../../../shared/models/loadFileJob.model';
import type { LoadFileStatus } from '../../../../shared/models/loadFileStatus.model';

describe('LoadProducts', () => {
  let component: LoadProducts;
  let fixture: ComponentFixture<LoadProducts>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let localeRouteServiceSpy: jasmine.SpyObj<LocaleRouteService>;

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'addProductsFromFile',
      'getLoadFileStatus'
    ]);
    localeRouteServiceSpy = jasmine.createSpyObj<LocaleRouteService>('LocaleRouteService', [
      'navigateToRoute'
    ]);

    const mockJob: LoadFileJob = {
      jobId: 'test-job',
      status: 'pending',
      totalLines: 0
    };

    const mockStatus: LoadFileStatus = {
      jobId: 'test-job',
      status: 'completed',
      progress: {
        totalLines: 1,
        processedLines: 1,
        successfulLines: 1,
        errorLines: 0,
        rejectedLines: 0,
        percentage: 100
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      resultUrl: 'https://example.com/result.csv'
    };

    productsServiceSpy.addProductsFromFile.and.returnValue(of(mockJob));
    productsServiceSpy.getLoadFileStatus.and.returnValue(of(mockStatus));

    await TestBed.configureTestingModule({
      imports: [
        LoadProducts,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: LocaleRouteService, useValue: localeRouteServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
