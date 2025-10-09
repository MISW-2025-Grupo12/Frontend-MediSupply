import { TestBed } from '@angular/core/testing';
import { LocaleRouteService } from './locale-route.service';

describe('LocaleRouteService', () => {
  let service: LocaleRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocaleRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

