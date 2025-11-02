import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Footer } from './footer';
import { AppStore } from '../../state/app.store';

describe('Footer', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AppStore
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    
    // Trigger ngOnInit - this will make the HTTP request
    fixture.detectChanges();
    
    // Handle the HTTP request made during ngOnInit
    const req = httpMock.expectOne('http://localhost:8080/auth/version');
    expect(req.request.method).toBe('GET');
    
    // Flush the response synchronously
    req.flush({ version: '1.0.0' });
    
    // The response is processed synchronously, so version should be set
    expect(component.version).toBe('1.0.0');
  });

  it('should fetch version on init', () => {
    const mockVersion = '1.2.0';
    
    // Verify no pending requests from previous test
    httpMock.expectNone('http://localhost:8080/auth/version');
    
    // Create a fresh fixture for this test
    fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;
    
    // Trigger ngOnInit - this will make the HTTP request
    fixture.detectChanges();
    
    // Expect the HTTP request to fetch version
    const req = httpMock.expectOne('http://localhost:8080/auth/version');
    expect(req.request.method).toBe('GET');
    
    // Flush the response synchronously
    req.flush({ version: mockVersion });
    
    // The response is processed synchronously, so version should be set
    expect(component.version).toBe(mockVersion);
  });
});
