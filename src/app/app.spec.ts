import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { App } from './app';
import { TEST_ROUTES } from './core/testing/test-routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: { 
            en: { header: { products: 'Products', clients: 'Clients', language: 'Language' } },
            es: { header: { products: 'Productos', clients: 'Clientes', language: 'Idioma' } }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(TEST_ROUTES),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    // Register the logo-header icon to prevent console errors
    const iconRegistry = TestBed.inject(MatIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);
    iconRegistry.addSvgIcon(
      'logo-header',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo-header.svg')
    );
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
