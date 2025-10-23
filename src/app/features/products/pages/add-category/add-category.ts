import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslocoDirective } from '@ngneat/transloco';
import { ProductsService } from '../../services/products.service';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
    ,TranslocoDirective
  ],
  templateUrl: './add-category.html',
  styleUrls: ['./add-category.scss']
})
export class AddCategory implements OnInit {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private localeRouteService = inject(LocaleRouteService);

  categoryForm!: FormGroup;
  saving = false;

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      // description is optional, but if provided must be at least 5 chars
      description: ['', [this.optionalMinLength(5)]]
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (control?.hasError('required')) return 'addCategory.form.required';
    if (control?.hasError('min')) return 'addCategory.form.minValue';
    if (control?.hasError('minlength')) return 'addCategory.form.minValue';
    return '';
  }

  private optionalMinLength(min: number) {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      return value && value.length >= min ? null : { minlength: { requiredLength: min, actualLength: value ? value.length : 0 } };
    };
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => this.categoryForm.get(key)?.markAsTouched());
      return;
    }

    const value = this.categoryForm.value;
    this.saving = true;

    this.productsService.createProductCategory({
      name: value.name,
      description: value.description
    }).subscribe({
      next: (category) => {
        this.saving = false;
          this.localeRouteService.navigateToRoute('products');
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.localeRouteService.navigateToRoute('products');
  }
}
