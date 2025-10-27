import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { RegisterPage } from './register-page';
import { RegisterForm, RegisterData } from '../../ui/register-form/register-form';
import { AuthService } from '../../services/auth.service';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { UserType } from '../../../../shared/enums/user-type';
import { AppUser } from '../../../../shared/models/user.model';
import { AppStore } from '../../../../core/state/app.store';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let debugElement: DebugElement;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLocaleRouteService: jasmine.SpyObj<LocaleRouteService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let userSignal: ReturnType<typeof signal<AppUser | null>>;
  let isLoggedInSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['createUser', 'getCurrentUser']);
    const localeRouteServiceSpy = jasmine.createSpyObj('LocaleRouteService', ['navigateToRoute']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userSignal = signal<AppUser | null>(null);
    isLoggedInSignal = signal(false);
    const apiBusySignal = signal(false);
    const errorSignal = signal<string | null>(null);
    
    const appStoreSpy = jasmine.createSpyObj('AppStore', ['user', 'isLoggedIn', 'setError'], {
      apiBusy: apiBusySignal,
      error: errorSignal
    });
    
    // Set up user and isLoggedIn to return functions that return values
    appStoreSpy.user.and.callFake(() => userSignal());
    appStoreSpy.isLoggedIn.and.callFake(() => isLoggedInSignal());

    await TestBed.configureTestingModule({
      imports: [
        RegisterPage,
        RegisterForm,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'register.title': 'Create Account',
              'register.backToLogin': 'Back to Login'
            },
            es: {
              'register.title': 'Crear Cuenta',
              'register.backToLogin': 'Volver al Login'
            }
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LocaleRouteService, useValue: localeRouteServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AppStore, useValue: appStoreSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockLocaleRouteService = TestBed.inject(LocaleRouteService) as jasmine.SpyObj<LocaleRouteService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAppStore = TestBed.inject(AppStore) as jasmine.SpyObj<AppStore>;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject required services', () => {
      expect(component['localeRouteService']).toBeDefined();
      expect(component['authService']).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when navigateToLogin is called', () => {
      component.navigateToLogin();
      
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('login');
    });

    it('should navigate to dashboard after successful registration when user is authenticated', async () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));
      userSignal.set(mockUser);
      isLoggedInSignal.set(true);

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      component.onRegister(registerData);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAuthService.createUser).toHaveBeenCalled();
      expect(mockAppStore.user).toHaveBeenCalled();
      expect(mockAppStore.isLoggedIn).toHaveBeenCalled();
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('dashboard');
    });

    it('should navigate to login page when user is created but not properly authenticated', async () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));
      userSignal.set(null); // User not set
      isLoggedInSignal.set(false); // Not authenticated

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      component.onRegister(registerData);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAuthService.createUser).toHaveBeenCalled();
      expect(mockAppStore.user).toHaveBeenCalled();
      expect(mockAppStore.isLoggedIn).toHaveBeenCalled();
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('login');
    });
  });

  describe('User Registration Flow', () => {
    it('should call authService.createUser with correct AppUser data', () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123',
        role: UserType.CUSTOMER
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });

    it('should handle different user types correctly', () => {
      const mockUser: AppUser = {
        id: '456',
        name: 'Jane Seller',
        email: 'jane@example.com',
        legalId: '87654321',
        phone: '+9876543210',
        address: '456 Business Ave',
        role: UserType.SELLER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.SELLER,
        name: 'Jane Seller',
        email: 'jane@example.com',
        dni: '87654321',
        phone: '+9876543210',
        address: '456 Business Ave',
        password: 'seller123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: 'Jane Seller',
        email: 'jane@example.com',
        legalId: '87654321',
        phone: '+9876543210',
        address: '456 Business Ave',
        password: 'seller123',
        role: UserType.SELLER
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });

    it('should handle ADMIN role without address', () => {
      const mockUser: AppUser = {
        id: '789',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '11223344',
        phone: '+1111111111',
        address: '',
        role: UserType.ADMIN
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.ADMIN,
        name: 'Admin User',
        email: 'admin@example.com',
        dni: '11223344',
        phone: '+1111111111',
        address: '',
        password: 'admin123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '11223344',
        phone: '+1111111111',
        address: '',
        password: 'admin123',
        role: UserType.ADMIN
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });

    it('should handle DELIVERY role without address', () => {
      const mockUser: AppUser = {
        id: '101',
        name: 'Delivery Person',
        email: 'delivery@example.com',
        legalId: '55667788',
        phone: '+2222222222',
        address: '',
        role: UserType.DELIVERY
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.DELIVERY,
        name: 'Delivery Person',
        email: 'delivery@example.com',
        dni: '55667788',
        phone: '+2222222222',
        address: '',
        password: 'delivery123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: 'Delivery Person',
        email: 'delivery@example.com',
        legalId: '55667788',
        phone: '+2222222222',
        address: '',
        password: 'delivery123',
        role: UserType.DELIVERY
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle registration errors gracefully', () => {
      const error = new Error('Registration failed');
      mockAuthService.createUser.and.returnValue(throwError(() => error));
      
      // Spy on console.error to verify error logging
      spyOn(console, 'error');

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      component.onRegister(registerData);

      expect(mockAuthService.createUser).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Registration failed:', error);
      expect(mockLocaleRouteService.navigateToRoute).not.toHaveBeenCalled();
    });

    it('should not navigate on registration error', () => {
      mockAuthService.createUser.and.returnValue(throwError(() => new Error('API Error')));

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'John Doe',
        email: 'john@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123'
      };

      component.onRegister(registerData);

      expect(mockLocaleRouteService.navigateToRoute).not.toHaveBeenCalled();
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform RegisterData to AppUser', () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        role: UserType.PROVIDER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.PROVIDER,
        name: 'Test User',
        email: 'test@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        password: 'test123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: registerData.name,
        email: registerData.email,
        legalId: registerData.dni,
        phone: registerData.phone,
        address: registerData.address,
        password: registerData.password,
        role: registerData.role
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });

    it('should handle empty address for roles that do not require it', () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '',
        role: UserType.ADMIN
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.ADMIN,
        name: 'Admin User',
        email: 'admin@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: '',
        password: 'admin123'
      };

      component.onRegister(registerData);

      const expectedAppUser: AppUser = {
        id: '',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '',
        password: 'admin123',
        role: UserType.ADMIN
      };

      expect(mockAuthService.createUser).toHaveBeenCalledWith(expectedAppUser);
    });
  });

  describe('UI Elements', () => {
    it('should render the register form component', () => {
      const registerForm = debugElement.query(By.css('app-register-form'));
      expect(registerForm).toBeTruthy();
    });

    it('should render the page title', () => {
      const title = debugElement.query(By.css('.page-title'));
      expect(title).toBeTruthy();
    });

    it('should render the logo image', () => {
      const logo = debugElement.query(By.css('.logo-image'));
      expect(logo).toBeTruthy();
      expect(logo.nativeElement.src).toContain('MediSupplyLogo.png');
      expect(logo.nativeElement.alt).toBe('MediSupply Logo');
    });

    it('should render the back to login link', () => {
      const loginLink = debugElement.query(By.css('.login-link'));
      expect(loginLink).toBeTruthy();
    });

    it('should call navigateToLogin when login link is clicked', () => {
      const loginLink = debugElement.query(By.css('.login-link'));
      loginLink.nativeElement.click();
      
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('login');
    });

    it('should have proper CSS classes', () => {
      const registerPage = debugElement.query(By.css('.register-page'));
      const registerContainer = debugElement.query(By.css('.register-container'));
      const logoSection = debugElement.query(By.css('.logo-section'));
      const formSection = debugElement.query(By.css('.form-section'));
      const loginSection = debugElement.query(By.css('.login-section'));

      expect(registerPage).toBeTruthy();
      expect(registerContainer).toBeTruthy();
      expect(logoSection).toBeTruthy();
      expect(formSection).toBeTruthy();
      expect(loginSection).toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should handle register form submission', async () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Form User',
        email: 'form@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Form Address',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));
      userSignal.set(mockUser);
      isLoggedInSignal.set(true);

      const registerForm = debugElement.query(By.css('app-register-form'));
      const registerFormComponent = registerForm.componentInstance as RegisterForm;

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'Form User',
        email: 'form@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: 'Form Address',
        password: 'form123'
      };

      // Simulate form submission
      registerFormComponent.registerSubmitted.emit(registerData);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAuthService.createUser).toHaveBeenCalled();
      expect(mockAppStore.user).toHaveBeenCalled();
      expect(mockAppStore.isLoggedIn).toHaveBeenCalled();
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('dashboard');
    });

    it('should pass the onRegister method to the register form', () => {
      const registerForm = debugElement.query(By.css('app-register-form'));
      expect(registerForm).toBeTruthy();
      
      // The form should be connected to the component's onRegister method
      // This is verified by the template binding: (registerSubmitted)="onRegister($event)"
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for user creation', () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Service Test',
        email: 'service@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Service Address',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'Service Test',
        email: 'service@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: 'Service Address',
        password: 'service123'
      };

      component.onRegister(registerData);

      expect(mockAuthService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should use LocaleRouteService for navigation', () => {
      component.navigateToLogin();
      
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledTimes(1);
      expect(mockLocaleRouteService.navigateToRoute).toHaveBeenCalledWith('login');
    });
  });

  describe('Console Logging', () => {
    it('should log successful user creation and authentication validation', async () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Log Test',
        email: 'log@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Log Address',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));
      userSignal.set(mockUser);
      isLoggedInSignal.set(true);
      spyOn(console, 'log');

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'Log Test',
        email: 'log@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: 'Log Address',
        password: 'log123'
      };

      component.onRegister(registerData);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(console.log).toHaveBeenCalledWith('User created successfully:', mockUser);
      expect(console.log).toHaveBeenCalledWith('User is authenticated, navigating to dashboard');
    });

    it('should log warning when user is created but not authenticated', async () => {
      const mockUser: AppUser = {
        id: '123',
        name: 'Log Test',
        email: 'log@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Log Address',
        role: UserType.CUSTOMER
      };

      mockAuthService.createUser.and.returnValue(of(mockUser));
      userSignal.set(null);
      isLoggedInSignal.set(false);
      spyOn(console, 'log');
      spyOn(console, 'warn');

      const registerData: RegisterData = {
        role: UserType.CUSTOMER,
        name: 'Log Test',
        email: 'log@example.com',
        dni: '12345678',
        phone: '+1234567890',
        address: 'Log Address',
        password: 'log123'
      };

      component.onRegister(registerData);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(console.log).toHaveBeenCalledWith('User created successfully:', mockUser);
      expect(console.warn).toHaveBeenCalledWith('User created but not properly authenticated, redirecting to login');
    });
  });
});
