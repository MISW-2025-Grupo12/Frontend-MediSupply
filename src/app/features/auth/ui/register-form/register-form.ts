import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { UserType } from '../../../../shared/enums/user-type';

export interface RegisterData {
  role: UserType;
  name: string;
  email: string;
  dni: string;
  phone: string;
  address: string;
  password: string;
}

@Component({
  selector: 'app-register-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss'
})
export class RegisterForm {
  @Output() registerSubmitted = new EventEmitter<RegisterData>();

  registerForm: FormGroup;
  userTypes = [
    UserType.SELLER,
    UserType.CUSTOMER,
    UserType.DELIVERY,
    UserType.PROVIDER
  ];

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      role: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      address: ['', [Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Watch for role changes to update address validation
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const addressControl = this.registerForm.get('address');
      if (role === UserType.ADMIN || role === UserType.DELIVERY) {
        // Address not required for ADMIN and DELIVERY
        addressControl?.clearValidators();
      } else {
        // Address required for other roles
        addressControl?.setValidators([Validators.required, Validators.minLength(5)]);
      }
      addressControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const registerData: RegisterData = {
        role: formValue.role,
        name: formValue.name,
        email: formValue.email,
        dni: formValue.dni,
        phone: formValue.phone,
        address: formValue.address,
        password: formValue.password
      };
      this.registerSubmitted.emit(registerData);
    }
  }
}
