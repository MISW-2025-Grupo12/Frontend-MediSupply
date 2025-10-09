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

  productForm!: FormGroup;
  providers: Provider[] = [];
  loadingProviders = false;

  categories: ProductCategory[] = [
    { value: 'medicines', translationKey: 'addProduct.categories.medicines' },
    { value: 'equipment', translationKey: 'addProduct.categories.equipment' },
    { value: 'supplies', translationKey: 'addProduct.categories.supplies' },
    { value: 'personal_care', translationKey: 'addProduct.categories.personal_care' },
    { value: 'emergency', translationKey: 'addProduct.categories.emergency' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadProviders();
  }

  private loadProviders(): void {
    this.loadingProviders = true;
    
    // TODO: Update the endpoint path based on your API
    this.apiClient.get<Provider[]>('/proveedores', 'users').subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loadingProviders = false;
      },
      error: (error) => {
        console.error('Error loading providers:', error);
        this.loadingProviders = false;
        // Fallback to empty array if API fails
        this.providers = [];
      }
    });
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
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
      // TODO: Add API call to create product
      this.onCancel();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.localeRouteService.navigateToRoute('products');
  }
}

