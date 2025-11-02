import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { signal } from '@angular/core';
import { LoginPage } from './login.page';
import { AuthStore } from '../../../state/auth.store';
import { AppStore } from '../../../../../core/state/app.store';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authStoreSpy: jasmine.SpyObj<AuthStore>;
  let mockAppStore: jasmine.SpyObj<AppStore>;

  beforeEach(async () => {
    authStoreSpy = jasmine.createSpyObj('AuthStore', ['login']);
    
    mockAppStore = jasmine.createSpyObj('AppStore', ['setError', 'setApiBusy'], {
      apiBusy: signal(false),
      error: signal(null)
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginPage,
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
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: AppStore, useValue: mockAppStore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
