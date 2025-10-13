import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../../shared/models/product.model';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 15,
    expirationDate: new Date('2025-12-31'),
    category: { id: '1', name: 'Test Category', description: 'Test Category Description' },
    provider: { id: '1', name: 'Test Provider', email: 'test@provider.com' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductCardComponent,
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
              }
            }
          },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product information', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card-title').textContent).toContain('Test Product');
    expect(compiled.querySelector('mat-card-subtitle').textContent).toContain('Test Category');
  });

  it('should detect near expiry products', () => {
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 15);
    expect(component.isNearExpiry(nearExpiryDate)).toBe(true);
  });

  it('should not detect near expiry for distant dates', () => {
    const distantDate = new Date();
    distantDate.setDate(distantDate.getDate() + 60);
    expect(component.isNearExpiry(distantDate)).toBe(false);
  });

  it('should show low stock chip when stock is below 10', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 };
    fixture.componentRef.setInput('product', lowStockProduct);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.low-stock-chip')).toBeTruthy();
  });
});
