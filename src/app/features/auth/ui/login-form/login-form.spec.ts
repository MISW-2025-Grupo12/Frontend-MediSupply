import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginForm,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: { 
            en: { 
              login: { 
                welcome: 'Welcome',
                subtitle: 'Please login',
                form: {
                  email: 'Email',
                  password: 'Password',
                  loginButton: 'Login',
                  emailPlaceholder: 'Enter email',
                  passwordPlaceholder: 'Enter password',
                  forgotPassword: 'Forgot password?',
                  required: 'Required',
                  invalidEmail: 'Invalid email',
                  minLength: 'Min length'
                }
              } 
            },
            es: { 
              login: { 
                welcome: 'Bienvenido',
                subtitle: 'Por favor inicie sesión',
                form: {
                  email: 'Correo',
                  password: 'Contraseña',
                  loginButton: 'Iniciar sesión',
                  emailPlaceholder: 'Ingrese correo',
                  passwordPlaceholder: 'Ingrese contraseña',
                  forgotPassword: '¿Olvidó la contraseña?',
                  required: 'Requerido',
                  invalidEmail: 'Correo inválido',
                  minLength: 'Longitud mínima'
                }
              } 
            }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTruthy();
    
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });
});
