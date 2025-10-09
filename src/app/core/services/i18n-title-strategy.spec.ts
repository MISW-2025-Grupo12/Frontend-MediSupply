import { TestBed } from '@angular/core/testing';
import { I18nTitleStrategy } from './i18n-title-strategy';

describe('I18nTitleStrategy', () => {
  let service: I18nTitleStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nTitleStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

