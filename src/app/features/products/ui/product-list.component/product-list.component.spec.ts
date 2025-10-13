import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { ProductListComponent } from './product-list.component';
import { Product } from '../../../../shared/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      stock: 10,
      expirationDate: new Date('2025-12-31'),
      category: { id: '1', name: 'Category 1', description: 'Category 1 Description' },
      provider: { id: '1', name: 'Provider 1', email: 'provider1@test.com' }
    },
    {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      stock: 20,
      expirationDate: new Date('2025-11-30'),
      category: { id: '2', name: 'Category 2', description: 'Category 2 Description' },
      provider: { id: '2', name: 'Provider 2', email: 'provider2@test.com' }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              productCard: {
                price: 'Price',
                stock: 'Stock',
                units: 'units',
                provider: 'Provider',
                expires: 'Expires',
                lowStock: 'Low Stock',
                nearExpiry: 'Near Expiry'
              },
              productList: {
                noProducts: 'No products available'
              }
            }
          },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', mockProducts);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product cards for each product', () => {
    const compiled = fixture.nativeElement;
    const productCards = compiled.querySelectorAll('app-product-card');
    expect(productCards.length).toBe(2);
  });

  it('should display empty state when no products', () => {
    fixture.componentRef.setInput('products', []);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.textContent).toContain('No products available');
  });
});
