import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { Provider } from '../../../../shared/models/provider.model';
import { Category } from '../../../../shared/models/category.model';
import { CategoryDTO } from '../../../../shared/DTOs/categoryDTO.model';
import { ProviderDTO } from '../../../../shared/DTOs/providerDTO.model';
import { map } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../../../shared/models/product.model';

interface ProductCategory {
  value: string;
  translationKey: string;
}

@Component({
  selector: 'app-add-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective
  ],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss'
})
export class AddProduct implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);
  private apiClient = inject(ApiClientService);
  private productsService = inject(ProductsService); 

  productForm!: FormGroup;
  providers: Provider[] = [];
  categories: Category[] = [];
  loading = false;

  ngOnInit(): void {
    this.initForm();
    this.loadProviders();
    this.loadCategories();
  }

  private loadProviders(): void {
    this.loading = true;

    this.productsService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.loading = false;
        this.providers = [];
      }
    });    
  }

  private loadCategories(): void {
    this.loading = true;

    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
        this.categories = [];
      }
    });
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      stock: [null, [Validators.required, Validators.min(1)]],
      expirationDate: [null, Validators.required],
      providerId: [null, Validators.required], // Changed to providerId for dropdown
      price: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'addProduct.form.required';
    }
    if (control?.hasError('min')) {
      return 'addProduct.form.minValue';
    }
    if (control?.hasError('minlength')) {
      return 'addProduct.form.required';
    }
    return '';
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Product data:', this.productForm.value);

      const product: Product = {
        ...this.productForm.value,
        category: this.categories.find(c => c.id === this.productForm.value.category),
        provider: this.providers.find(p => p.id === this.productForm.value.providerId)
      }

      console.log('Product:', product);

      this.productsService.addProduct(product).subscribe({
        next: (product) => {
          console.log('Product added:', product);
          // Navigate back to products page (products will refresh automatically)
          this.onCancel();
        },
        error: (error) => {
          console.error('Error adding product:', error);
        }
      });
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.localeRouteService.navigateToRoute('products');
  }
}

