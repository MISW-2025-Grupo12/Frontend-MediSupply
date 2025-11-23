import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { LocaleRouteService } from './locale-route.service';
import { TEST_ROUTES } from '../testing/test-routes';

describe('LocaleRouteService', () => {
  let service: LocaleRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(TEST_ROUTES)
      ]
    });
    service = TestBed.inject(LocaleRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

