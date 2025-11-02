import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AddProduct } from './add-product';
import { ProductsService } from '../../services/products.service';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { Provider } from '../../../../shared/models/provider.model';
import { Category } from '../../../../shared/models/category.model';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Product } from '../../../../shared/models/product.model';

describe('AddProduct', () => {
  let component: AddProduct;
  let fixture: ComponentFixture<AddProduct>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let localeRouteService: jasmine.SpyObj<LocaleRouteService>;
  let apiClientServiceSpy: jasmine.SpyObj<ApiClientService>;

  const mockProviders: Provider[] = [
    { id: 1, name: 'Provider 1', email: 'provider1@test.com' },
    { id: 2, name: 'Provider 2', email: 'provider2@test.com' }
  ];

  const mockCategories: Category[] = [
    { id: 1, name: 'Medicines', description: 'Medical products' },
    { id: 2, name: 'Equipment', description: 'Medical equipment' }
  ];

  beforeEach(async () => {
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProviders', 'getCategories', 'createProduct', 'addProduct']);
    const localeRouteServiceSpy = jasmine.createSpyObj('LocaleRouteService', ['navigateToRoute']);
    apiClientServiceSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'patch', 'delete']);

    productsServiceSpy.getProviders.and.returnValue(of(mockProviders));
    productsServiceSpy.getCategories.and.returnValue(of(mockCategories));

    // Setup ApiClientService spy to return observables BEFORE TestBed configuration
    apiClientServiceSpy.post.and.returnValue(of({}));
    apiClientServiceSpy.get.and.returnValue(of({}));
    apiClientServiceSpy.put.and.returnValue(of({}));
    apiClientServiceSpy.patch.and.returnValue(of({}));
    apiClientServiceSpy.delete.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        AddProduct,
        NoopAnimationsModule,
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
        provideRouter([]),
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: LocaleRouteService, useValue: localeRouteServiceSpy },
        { provide: ApiClientService, useValue: apiClientServiceSpy }
      ]
    }).compileComponents();

    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    localeRouteService = TestBed.inject(LocaleRouteService) as jasmine.SpyObj<LocaleRouteService>;

    fixture = TestBed.createComponent(AddProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('description')?.value).toBe('');
      expect(component.productForm.get('category')?.value).toBe('');
      expect(component.productForm.get('stock')?.value).toBeNull();
      expect(component.productForm.get('expirationDate')?.value).toBeNull();
      expect(component.productForm.get('providerId')?.value).toBeNull();
      expect(component.productForm.get('price')?.value).toBeNull();
    });

    it('should have all required validators', () => {
      const form = component.productForm;
      
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('description')?.hasError('required')).toBe(true);
      expect(form.get('category')?.hasError('required')).toBe(true);
      expect(form.get('stock')?.hasError('required')).toBe(true);
      expect(form.get('expirationDate')?.hasError('required')).toBe(true);
      expect(form.get('providerId')?.hasError('required')).toBe(true);
      expect(form.get('price')?.hasError('required')).toBe(true);
    });

    it('should validate minimum length for name', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);
      
      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate minimum length for description', () => {
      const descControl = component.productForm.get('description');
      descControl?.setValue('short');
      expect(descControl?.hasError('minlength')).toBe(true);
      
      descControl?.setValue('This is a valid description');
      expect(descControl?.hasError('minlength')).toBe(false);
    });

    it('should validate minimum value for stock', () => {
      const stockControl = component.productForm.get('stock');
      stockControl?.setValue(0);
      expect(stockControl?.hasError('min')).toBe(true);
      
      stockControl?.setValue(1);
      expect(stockControl?.hasError('min')).toBe(false);
    });

    it('should validate minimum value for price', () => {
      const priceControl = component.productForm.get('price');
      priceControl?.setValue(0);
      expect(priceControl?.hasError('min')).toBe(true);
      
      priceControl?.setValue(0.01);
      expect(priceControl?.hasError('min')).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should load providers on init', () => {
      expect(productsService.getProviders).toHaveBeenCalled();
      expect(component.providers).toEqual(mockProviders);
    });

    it('should load categories on init', () => {
      expect(productsService.getCategories).toHaveBeenCalled();
      expect(component.categories).toEqual(mockCategories);
    });

    it('should handle provider loading error', () => {
      const error = new Error('API Error');
      productsService.getProviders.and.returnValue(throwError(() => error));
      spyOn(console, 'error');
      
      component.ngOnInit();
      
      expect(console.error).toHaveBeenCalled();
      expect(component.providers).toEqual([]);
      expect(component.loading).toBe(false);
    });

    it('should handle category loading error', () => {
      const error = new Error('API Error');
      productsService.getCategories.and.returnValue(throwError(() => error));
      spyOn(console, 'error');
      
      component.ngOnInit();
      
      expect(console.error).toHaveBeenCalled();
      expect(component.categories).toEqual([]);
      expect(component.loading).toBe(false);
    });

    it('should set loading flag to false after data loads', () => {
      expect(component.loading).toBe(false);
      expect(component.providers.length).toBeGreaterThan(0);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.productForm.patchValue({
        name: 'Test Product',
        description: 'This is a test product description',
        category: {
          id: 1,
          name: 'Medicines',
          description: 'Medical products'
        },
        stock: 10,
        expirationDate: new Date('2025-12-31'),
        providerId: {
          id: 1,
          name: 'Provider 1',
          email: 'provider1@test.com'
        },
        price: 99.99
      });
    });

    it('should call onCancel when form is valid and submitted', () => {
      productsService.addProduct.and.returnValue(of({} as Product));
      spyOn(component, 'onCancel');
      component.onSubmit();
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      component.productForm.patchValue({ name: '' });
      spyOn(component, 'onCancel');
      
      component.onSubmit();
      
      expect(component.onCancel).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.productForm.patchValue({ name: '' });
      
      component.onSubmit();
      
      expect(component.productForm.get('name')?.touched).toBe(true);
      expect(component.productForm.get('description')?.touched).toBe(true);
      expect(component.productForm.get('category')?.touched).toBe(true);
    });

    it('should log product data when form is valid', () => {
      productsService.addProduct.and.returnValue(of({} as Product));
      spyOn(console, 'log');
      
      component.onSubmit();
      
      expect(console.log).toHaveBeenCalledWith('Product data:', jasmine.objectContaining({
        name: 'Test Product',
        stock: 10
      }));
    });
  });

  describe('Navigation', () => {
    it('should navigate to products list on cancel', () => {
      component.onCancel();
      expect(localeRouteService.navigateToRoute).toHaveBeenCalledWith('products');
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      
      const errorMsg = component.getErrorMessage('name');
      expect(errorMsg).toBe('addProduct.form.required');
    });

    it('should return min value error message', () => {
      const stockControl = component.productForm.get('stock');
      stockControl?.setValue(0);
      stockControl?.markAsTouched();
      
      const errorMsg = component.getErrorMessage('stock');
      expect(errorMsg).toBe('addProduct.form.minValue');
    });

    it('should return minlength error message', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('ab');
      nameControl?.markAsTouched();
      
      const errorMsg = component.getErrorMessage('name');
      expect(errorMsg).toBe('addProduct.form.required');
    });

    it('should return empty string when no errors', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('Valid Name');
      
      const errorMsg = component.getErrorMessage('name');
      expect(errorMsg).toBe('');
    });
  });

  describe('Form Validity', () => {
    it('should be invalid when empty', () => {
      expect(component.productForm.valid).toBe(false);
    });

    it('should be valid with all required fields filled', () => {
      component.productForm.patchValue({
        name: 'Test Product',
        description: 'This is a valid description with enough characters',
        category: 1,
        stock: 10,
        expirationDate: new Date('2025-12-31'),
        providerId: 1,
        price: 99.99
      });
      
      expect(component.productForm.valid).toBe(true);
    });
  });
});

