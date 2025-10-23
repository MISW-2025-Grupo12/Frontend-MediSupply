import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AddCategory } from './add-category';
import { ProductsService } from '../../services/products.service';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('AddCategory', () => {
  let component: AddCategory;
  let fixture: ComponentFixture<AddCategory>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let localeRouteService: jasmine.SpyObj<LocaleRouteService>;

  beforeEach(async () => {
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', ['createProductCategory']);
    const localeRouteServiceSpy = jasmine.createSpyObj('LocaleRouteService', ['navigateToRoute']);

    await TestBed.configureTestingModule({
      imports: [
        AddCategory,
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
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: LocaleRouteService, useValue: localeRouteServiceSpy }
      ]
    }).compileComponents();

    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    localeRouteService = TestBed.inject(LocaleRouteService) as jasmine.SpyObj<LocaleRouteService>;

    fixture = TestBed.createComponent(AddCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.categoryForm).toBeDefined();
      expect(component.categoryForm.get('name')?.value).toBe('');
      expect(component.categoryForm.get('description')?.value).toBe('');
    });

    it('should require name and enforce minlength', () => {
      const name = component.categoryForm.get('name');
      expect(name?.hasError('required')).toBeTrue();

      name?.setValue('ab');
      expect(name?.hasError('minlength')).toBeTrue();

      name?.setValue('abc');
      expect(name?.valid).toBeTrue();
    });

    it('should enforce minlength for description when present', () => {
      const desc = component.categoryForm.get('description');

      desc?.setValue('1234');
      expect(desc?.hasError('minlength')).toBeTrue();

      desc?.setValue('12345');
      expect(desc?.hasError('minlength')).toBeFalse();
    });
  });

  describe('Submission', () => {
    it('should not submit when form is invalid and should mark touched', () => {
      spyOn(component.categoryForm, 'markAllAsTouched').and.callThrough();
      component.onSubmit();
      expect(component.categoryForm.valid).toBeFalse();
      // markAllAsTouched is a convenience; we mark fields individually in the component
      expect(component.categoryForm.get('name')?.touched).toBeTrue();
    });

    it('should call createProductCategory and navigate on success', () => {
      const created = { id: '1', name: 'New Cat', description: 'descr' } as any;
      productsService.createProductCategory.and.returnValue(of(created));

      component.categoryForm.patchValue({ name: 'New Cat', description: 'descr' });

      component.onSubmit();
      // observable from `of` is synchronous so saving should flip back immediately
      expect(productsService.createProductCategory).toHaveBeenCalledWith({ name: 'New Cat', description: 'descr' });
      expect(component.saving).toBeFalse();
      expect(localeRouteService.navigateToRoute).toHaveBeenCalledWith('products');
    });

    it('should reset saving flag when create fails', () => {
      productsService.createProductCategory.and.returnValue(throwError(() => new Error('Fail')));

      component.categoryForm.patchValue({ name: 'New Cat', description: 'descr' });

      spyOn(console, 'error');
      component.onSubmit();
      // throwError triggers error synchronously on subscribe
      expect(component.saving).toBeFalse();
      expect(console.error).toHaveBeenCalled();
      expect(localeRouteService.navigateToRoute).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to products on cancel', () => {
      component.onCancel();
      expect(localeRouteService.navigateToRoute).toHaveBeenCalledWith('products');
    });
  });

  describe('Error Messages', () => {
    it('should return required error message for name', () => {
      const name = component.categoryForm.get('name');
      name?.setValue('');
      name?.markAsTouched();
      expect(component.getErrorMessage('name')).toBe('addCategory.form.required');
    });

    it('should return minlength message for description when too short', () => {
      const desc = component.categoryForm.get('description');
      desc?.setValue('1234');
      desc?.markAsTouched();
      expect(component.getErrorMessage('description')).toBe('addCategory.form.minValue');
    });
  });
});
