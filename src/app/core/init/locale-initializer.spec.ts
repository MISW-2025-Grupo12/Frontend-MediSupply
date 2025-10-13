import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { LocaleRouteService } from '../services/locale-route.service';
import { initializeLocale } from './locale-initializer';

describe('initializeLocale', () => {
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let localeRouteService: jasmine.SpyObj<LocaleRouteService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    translocoService = jasmine.createSpyObj('TranslocoService', ['getActiveLang', 'setActiveLang']);
    localeRouteService = jasmine.createSpyObj('LocaleRouteService', ['getCurrentLocale']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: TranslocoService, useValue: translocoService },
        { provide: LocaleRouteService, useValue: localeRouteService }
      ]
    });
  });

  it('should initialize locale from URL', async () => {
    localeRouteService.getCurrentLocale.and.returnValue('es');
    translocoService.getActiveLang.and.returnValue('en');

    const initializer = initializeLocale(router, translocoService, localeRouteService);
    await initializer();

    expect(translocoService.setActiveLang).toHaveBeenCalledWith('es');
  });

  it('should not change language if already set correctly', async () => {
    localeRouteService.getCurrentLocale.and.returnValue('en');
    translocoService.getActiveLang.and.returnValue('en');

    const initializer = initializeLocale(router, translocoService, localeRouteService);
    await initializer();

    expect(translocoService.setActiveLang).not.toHaveBeenCalled();
  });
});

