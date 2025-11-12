import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Footer } from './footer';
import { AppStore } from '../../state/app.store';
import { VersionDTO } from '../../../shared/DTOs/versionDTO.model';

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
    let latestVersion: string | undefined;
    const subscription = component.version$.subscribe((version) => (latestVersion = version));

    expect(component).toBeTruthy();
    
    // Trigger ngOnInit - this will make the HTTP request
    fixture.detectChanges();
    
    // Handle the HTTP request made during ngOnInit
    const req = httpMock.expectOne('http://localhost:8080/auth/version');
    expect(req.request.method).toBe('GET');
    
    // Flush the response synchronously
    const mockVersionDTO: VersionDTO = {
      version: '1.0.0',
      build_date: '2024-01-01T00:00:00Z',
      commit_hash: 'abc123',
      environment: 'test'
    };
    req.flush(mockVersionDTO);
    
    // The response is processed synchronously, so the latest emitted version should match
    expect(latestVersion).toBe('1.0.0');

    subscription.unsubscribe();
  });

  it('should fetch version on init', () => {
    const mockVersion = '1.2.0';
    
    // Verify no pending requests from previous test
    httpMock.expectNone('http://localhost:8080/auth/version');
    
    // Create a fresh fixture for this test
    fixture = TestBed.createComponent(Footer);
    const component = fixture.componentInstance;
    let latestVersion: string | undefined;
    const subscription = component.version$.subscribe((version) => (latestVersion = version));
    
    // Trigger ngOnInit - this will make the HTTP request
    fixture.detectChanges();
    
    // Expect the HTTP request to fetch version
    const req = httpMock.expectOne('http://localhost:8080/auth/version');
    expect(req.request.method).toBe('GET');
    
    // Flush the response synchronously
    const mockVersionDTO: VersionDTO = {
      version: mockVersion,
      build_date: '2024-01-01T00:00:00Z',
      commit_hash: 'def456',
      environment: 'test'
    };
    req.flush(mockVersionDTO);
    
    // The response is processed synchronously, so the latest emitted version should match
    expect(latestVersion).toBe(mockVersion);

    subscription.unsubscribe();
  });
});
