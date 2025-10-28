import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Products } from './products';
import { ProductsState } from '../../state/products.store';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
    // Mock ProductsState to prevent actual HTTP calls
    const mockProductsState = jasmine.createSpyObj('ProductsState', ['loadProducts']);
    
    // Mock the products signal
    Object.defineProperty(mockProductsState, 'products', {
      get: () => () => [],
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        Products,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: { 
            en: { header: { products: 'Products' }, addProduct: { title: 'Add Product' } },
            es: { header: { products: 'Productos' }, addProduct: { title: 'Añadir Producto' } }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductsState, useValue: mockProductsState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to add product page', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    
    component.navigateToAddProduct();
    
    expect(router.navigate).toHaveBeenCalled();
  });
});
