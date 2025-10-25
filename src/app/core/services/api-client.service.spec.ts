import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { AppStore } from '../state/app.store';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;
  let appStore: AppStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiClientService,
        AppStore
      ]
    });
    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
    appStore = TestBed.inject(AppStore);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform a GET request', () => {
    const mockResponse = { data: 'test' };
    const endpoint = '/test';

    service.get(endpoint).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.getBaseUrl()}${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should perform a POST request', () => {
    const mockResponse = { id: 1 };
    const endpoint = '/test';
    const body = { name: 'test' };

    service.post(endpoint, body).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.getBaseUrl()}${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('should build query parameters', () => {
    const params = service.buildParams({ id: 1, name: 'test', active: true });
    expect(params.get('id')).toBe('1');
    expect(params.get('name')).toBe('test');
    expect(params.get('active')).toBe('true');
  });

  it('should filter out null and undefined parameters', () => {
    const params = service.buildParams({ id: 1, name: null, active: undefined });
    expect(params.get('id')).toBe('1');
    expect(params.get('name')).toBeNull();
    expect(params.get('active')).toBeNull();
  });

  it('should include Authorization header when token exists', () => {
    const mockToken = 'test-token-123';
    appStore.setAccessToken(mockToken);
    
    const mockResponse = { data: 'test' };
    const endpoint = '/test';

    service.get(endpoint).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.getBaseUrl()}${endpoint}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockResponse);
  });

  it('should not include Authorization header when no token exists', () => {
    appStore.setAccessToken(null);
    
    const mockResponse = { data: 'test' };
    const endpoint = '/test';

    service.get(endpoint).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.getBaseUrl()}${endpoint}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush(mockResponse);
  });

  it('should include Authorization header in POST request when token exists', () => {
    const mockToken = 'test-token-123';
    appStore.setAccessToken(mockToken);
    
    const mockResponse = { id: 1 };
    const endpoint = '/test';
    const body = { name: 'test' };

    service.post(endpoint, body).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.getBaseUrl()}${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockResponse);
  });
});

