import { Component, inject, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

export interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm implements OnInit {
  private fb = inject(FormBuilder);

  loginSubmitted = output<LoginCredentials>();
  
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'login.form.required';
    }
    if (control?.hasError('email')) {
      return 'login.form.invalidEmail';
    }
    if (control?.hasError('minlength')) {
      return 'login.form.minLength';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginCredentials = this.loginForm.value;
      this.loginSubmitted.emit(credentials);
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
}
