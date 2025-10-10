import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { I18nTitleStrategy } from './i18n-title-strategy';

describe('I18nTitleStrategy', () => {
  let service: I18nTitleStrategy;

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
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(I18nTitleStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

