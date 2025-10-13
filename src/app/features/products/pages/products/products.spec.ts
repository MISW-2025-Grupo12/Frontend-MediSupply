import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Products } from './products';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
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
        provideRouter([])
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
    spyOn(component['router'], 'navigate');
    
    component.navigateToAddProduct();
    
    expect(component['router'].navigate).toHaveBeenCalled();
  });
});
