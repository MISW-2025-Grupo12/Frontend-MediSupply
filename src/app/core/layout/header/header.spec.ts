import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Header } from './header';
import { LocaleRouteService } from '../../services/locale-route.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    const localeRouteServiceSpy = jasmine.createSpyObj('LocaleRouteService', [
      'getCurrentLocale', 
      'getLocalizedUrl', 
      'changeLanguage'
    ]);
    
    localeRouteServiceSpy.getCurrentLocale.and.returnValue('en');
    localeRouteServiceSpy.getLocalizedUrl.and.returnValue('/en/products');

    await TestBed.configureTestingModule({
      imports: [
        Header,
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
        provideRouter([]),
        { provide: LocaleRouteService, useValue: localeRouteServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have currentLang property', () => {
    expect(component.currentLang).toBeDefined();
    expect(component.currentLang).toBe('en');
  });

  it('should call changeLanguage when switching language', () => {
    const localeRouteService = TestBed.inject(LocaleRouteService) as jasmine.SpyObj<LocaleRouteService>;
    
    component.switchLanguage();
    
    expect(localeRouteService.changeLanguage).toHaveBeenCalledWith('es');
  });

  it('should return localized products route', () => {
    const route = component.getProductsRoute();
    expect(route).toBe('/en/products');
  });

  it('should return localized clients route', () => {
    const localeRouteService = TestBed.inject(LocaleRouteService) as jasmine.SpyObj<LocaleRouteService>;
    localeRouteService.getLocalizedUrl.and.returnValue('/en/clients');
    
    const route = component.getClientsRoute();
    expect(route).toBe('/en/clients');
  });
});
