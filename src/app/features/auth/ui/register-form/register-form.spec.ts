import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RegisterForm, RegisterData } from './register-form';
import { UserType } from '../../../../shared/enums/user-type';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterForm,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'register.form.userType': 'User Type',
              'register.form.name': 'Name',
              'register.form.email': 'Email',
              'register.form.dni': 'DNI',
              'register.form.phone': 'Phone',
              'register.form.address': 'Address',
              'register.form.password': 'Password',
              'register.form.required': 'This field is required',
              'register.form.minLength': 'Minimum length required',
              'register.form.invalidEmail': 'Invalid email format',
              'register.form.invalidDni': 'Invalid DNI format',
              'register.form.invalidPhone': 'Invalid phone format',
              'register.form.createAccount': 'Create Account',
              'userTypes.ADMIN': 'Administrator',
              'userTypes.SELLER': 'Seller',
              'userTypes.CUSTOMER': 'Customer',
              'userTypes.DELIVERY': 'Delivery',
              'userTypes.PROVIDER': 'Provider'
            }
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty form', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('role')?.value).toBe('');
      expect(component.registerForm.get('name')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('dni')?.value).toBe('');
      expect(component.registerForm.get('phone')?.value).toBe('');
      expect(component.registerForm.get('address')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
    });

    it('should have all user types available', () => {
      expect(component.userTypes).toEqual([
        UserType.SELLER,
        UserType.CUSTOMER,
        UserType.DELIVERY,
        UserType.PROVIDER
      ]);
    });
  });

  describe('Form Validation', () => {
    describe('Role Field', () => {
      it('should be required', () => {
        const roleControl = component.registerForm.get('role');
        roleControl?.setValue('');
        expect(roleControl?.hasError('required')).toBeTruthy();
      });

      it('should be valid when a role is selected', () => {
        const roleControl = component.registerForm.get('role');
        roleControl?.setValue(UserType.CUSTOMER);
        expect(roleControl?.valid).toBeTruthy();
      });
    });

    describe('Name Field', () => {
      it('should be required', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('');
        expect(nameControl?.hasError('required')).toBeTruthy();
      });

      it('should have minimum length validation', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('A');
        expect(nameControl?.hasError('minlength')).toBeTruthy();
      });

      it('should be valid with proper name', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('John Doe');
        expect(nameControl?.valid).toBeTruthy();
      });
    });

    describe('Email Field', () => {
      it('should be required', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('');
        expect(emailControl?.hasError('required')).toBeTruthy();
      });

      it('should validate email format', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('invalid-email');
        expect(emailControl?.hasError('email')).toBeTruthy();
      });

      it('should be valid with proper email', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('test@example.com');
        expect(emailControl?.valid).toBeTruthy();
      });
    });

    describe('DNI Field', () => {
      it('should be required', () => {
        const dniControl = component.registerForm.get('dni');
        dniControl?.setValue('');
        expect(dniControl?.hasError('required')).toBeTruthy();
      });

      it('should validate DNI pattern', () => {
        const dniControl = component.registerForm.get('dni');
        dniControl?.setValue('123');
        expect(dniControl?.hasError('pattern')).toBeTruthy();
      });

      it('should be valid with proper DNI', () => {
        const dniControl = component.registerForm.get('dni');
        dniControl?.setValue('12345678');
        expect(dniControl?.valid).toBeTruthy();
      });
    });

    describe('Phone Field', () => {
      it('should be required', () => {
        const phoneControl = component.registerForm.get('phone');
        phoneControl?.setValue('');
        expect(phoneControl?.hasError('required')).toBeTruthy();
      });

      it('should validate phone pattern', () => {
        const phoneControl = component.registerForm.get('phone');
        phoneControl?.setValue('abc123');
        expect(phoneControl?.hasError('pattern')).toBeTruthy();
      });

      it('should be valid with proper phone', () => {
        const phoneControl = component.registerForm.get('phone');
        phoneControl?.setValue('+1234567890');
        expect(phoneControl?.valid).toBeTruthy();
      });
    });

    describe('Address Field', () => {
      it('should have minimum length validation', () => {
        const addressControl = component.registerForm.get('address');
        addressControl?.setValue('123');
        expect(addressControl?.hasError('minlength')).toBeTruthy();
      });

      it('should be valid with proper address', () => {
        const addressControl = component.registerForm.get('address');
        addressControl?.setValue('123 Main Street');
        expect(addressControl?.valid).toBeTruthy();
      });
    });

    describe('Password Field', () => {
      it('should be required', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('');
        expect(passwordControl?.hasError('required')).toBeTruthy();
      });

      it('should have minimum length validation', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('123');
        expect(passwordControl?.hasError('minlength')).toBeTruthy();
      });

      it('should be valid with proper password', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('password123');
        expect(passwordControl?.valid).toBeTruthy();
      });
    });
  });

  describe('Role-based Address Validation', () => {
    it('should make address required for CUSTOMER role', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      roleControl?.setValue(UserType.CUSTOMER);
      addressControl?.setValue('');
      
      expect(addressControl?.hasError('required')).toBeTruthy();
    });

    it('should make address required for SELLER role', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      roleControl?.setValue(UserType.SELLER);
      addressControl?.setValue('');
      
      expect(addressControl?.hasError('required')).toBeTruthy();
    });

    it('should make address required for PROVIDER role', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      roleControl?.setValue(UserType.PROVIDER);
      addressControl?.setValue('');
      
      expect(addressControl?.hasError('required')).toBeTruthy();
    });

    it('should not require address for ADMIN role', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      roleControl?.setValue(UserType.ADMIN);
      addressControl?.setValue('');
      
      expect(addressControl?.hasError('required')).toBeFalsy();
    });

    it('should not require address for DELIVERY role', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      roleControl?.setValue(UserType.DELIVERY);
      addressControl?.setValue('');
      
      expect(addressControl?.hasError('required')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should emit registerSubmitted event with form data when form is valid', () => {
      spyOn(component.registerSubmitted, 'emit');
      
      component.registerForm.patchValue({
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      });

      component.onSubmit();

      const expectedData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      expect(component.registerSubmitted.emit).toHaveBeenCalledWith(expectedData);
    });

    it('should not emit event when form is invalid', () => {
      spyOn(component.registerSubmitted, 'emit');
      
      component.registerForm.patchValue({
        role: '',
        name: '',
        email: 'invalid-email',
        dni: '123',
        phone: 'abc',
        address: '',
        password: '123'
      });

      component.onSubmit();

      expect(component.registerSubmitted.emit).not.toHaveBeenCalled();
    });

    it('should emit event for ADMIN role without address', () => {
      spyOn(component.registerSubmitted, 'emit');
      
      component.registerForm.patchValue({
        role: UserType.ADMIN,
        name: 'Admin User',
        email: 'admin@example.com',
        dni: '87654321',
        phone: '+9876543210',
        address: '',
        password: 'admin123'
      });

      component.onSubmit();

      const expectedData: RegisterData = {
        role: UserType.ADMIN,
        name: 'Admin User',
        email: 'admin@example.com',
        dni: '87654321',
        phone: '+9876543210',
        address: '',
        password: 'admin123'
      };

      expect(component.registerSubmitted.emit).toHaveBeenCalledWith(expectedData);
    });
  });

  describe('UI Elements', () => {
    it('should render all form fields', () => {
      const form = debugElement.query(By.css('form'));
      expect(form).toBeTruthy();

      const roleSelect = debugElement.query(By.css('mat-select[formControlName="role"]'));
      const nameInput = debugElement.query(By.css('input[formControlName="name"]'));
      const emailInput = debugElement.query(By.css('input[formControlName="email"]'));
      const dniInput = debugElement.query(By.css('input[formControlName="dni"]'));
      const phoneInput = debugElement.query(By.css('input[formControlName="phone"]'));
      const passwordInput = debugElement.query(By.css('input[formControlName="password"]'));

      expect(roleSelect).toBeTruthy();
      expect(nameInput).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(dniInput).toBeTruthy();
      expect(phoneInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    it('should render address field by default', () => {
      const addressInput = debugElement.query(By.css('input[formControlName="address"]'));
      expect(addressInput).toBeTruthy();
    });

    it('should hide address field for ADMIN role', () => {
      component.registerForm.get('role')?.setValue(UserType.ADMIN);
      fixture.detectChanges();

      const addressField = debugElement.query(By.css('.form-field:has(input[formControlName="address"])'));
      expect(addressField).toBeFalsy();
    });

    it('should hide address field for DELIVERY role', () => {
      component.registerForm.get('role')?.setValue(UserType.DELIVERY);
      fixture.detectChanges();

      const addressField = debugElement.query(By.css('.form-field:has(input[formControlName="address"])'));
      expect(addressField).toBeFalsy();
    });

    it('should show address field for CUSTOMER role', () => {
      component.registerForm.get('role')?.setValue(UserType.CUSTOMER);
      fixture.detectChanges();

      const addressInput = debugElement.query(By.css('input[formControlName="address"]'));
      expect(addressInput).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.registerForm.patchValue({
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      });
      fixture.detectChanges();

      const submitButton = debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });

    it('should render all user type options', () => {
      const roleSelect = debugElement.query(By.css('mat-select[formControlName="role"]'));
      roleSelect.nativeElement.click();
      fixture.detectChanges();

      const options = debugElement.queryAll(By.css('mat-option'));
      expect(options.length).toBe(4); // SELLER, CUSTOMER, DELIVERY, PROVIDER
    });
  });

  describe('Error Messages', () => {
    beforeEach(() => {
      // Mark all fields as touched to show error messages
      Object.keys(component.registerForm.controls).forEach(key => {
        component.registerForm.get(key)?.markAsTouched();
      });
    });

    it('should show required error for empty fields', () => {
      fixture.detectChanges();

      const requiredErrors = debugElement.queryAll(By.css('mat-error'));
      expect(requiredErrors.length).toBeGreaterThan(0);
    });

    it('should show minlength error for name field', () => {
      const nameControl = component.registerForm.get('name');
      nameControl?.setValue('A');
      nameControl?.markAsTouched(); // Mark as touched to show error
      fixture.detectChanges();

      const nameError = debugElement.query(By.css('mat-error'));
      expect(nameError).toBeTruthy();
    });

    it('should show email error for invalid email', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched(); // Mark as touched to show error
      fixture.detectChanges();

      const emailError = debugElement.query(By.css('mat-error'));
      expect(emailError).toBeTruthy();
    });

    it('should show pattern error for invalid DNI', () => {
      const dniControl = component.registerForm.get('dni');
      dniControl?.setValue('123');
      dniControl?.markAsTouched(); // Mark as touched to show error
      fixture.detectChanges();

      const dniError = debugElement.query(By.css('mat-error'));
      expect(dniError).toBeTruthy();
    });

    it('should show pattern error for invalid phone', () => {
      const phoneControl = component.registerForm.get('phone');
      phoneControl?.setValue('abc123');
      phoneControl?.markAsTouched(); // Mark as touched to show error
      fixture.detectChanges();

      const phoneError = debugElement.query(By.css('mat-error'));
      expect(phoneError).toBeTruthy();
    });

    it('should show minlength error for password', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('123');
      passwordControl?.markAsTouched(); // Mark as touched to show error
      fixture.detectChanges();

      const passwordError = debugElement.query(By.css('mat-error'));
      expect(passwordError).toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should update form validity when role changes', () => {
      const roleControl = component.registerForm.get('role');
      const addressControl = component.registerForm.get('address');
      
      // Set initial values
      component.registerForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        password: 'password123'
      });

      // Test with CUSTOMER role (address required)
      roleControl?.setValue(UserType.CUSTOMER);
      expect(component.registerForm.invalid).toBeTruthy();

      // Add address
      addressControl?.setValue('123 Main Street');
      expect(component.registerForm.valid).toBeTruthy();

      // Test with ADMIN role (address not required)
      roleControl?.setValue(UserType.ADMIN);
      addressControl?.setValue('');
      expect(component.registerForm.valid).toBeTruthy();
    });

    it('should handle form reset correctly', () => {
      component.registerForm.patchValue({
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      });

      component.registerForm.reset();

      // Form reset returns null for form controls, not empty strings
      expect(component.registerForm.get('role')?.value).toBeNull();
      expect(component.registerForm.get('name')?.value).toBeNull();
      expect(component.registerForm.get('email')?.value).toBeNull();
      expect(component.registerForm.get('dni')?.value).toBeNull();
      expect(component.registerForm.get('phone')?.value).toBeNull();
      expect(component.registerForm.get('address')?.value).toBeNull();
      expect(component.registerForm.get('password')?.value).toBeNull();
    });
  });
});
