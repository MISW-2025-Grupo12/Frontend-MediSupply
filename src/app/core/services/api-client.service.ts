import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AppStore } from '../state/app.store';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  withCredentials?: boolean;
}

export type ServiceType = 'default' | 'users' | 'products' | 'logistics' | 'sales' | 'auth';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient);
  private appStore = inject(AppStore);
  
  // Service URL mappings
  private serviceUrls: Record<string, string> = {
    default: environment.baseApiUrl,
    users: `${environment.baseApiUrl}/usuarios`,
    products: `${environment.baseApiUrl}/productos`,
    logistics: `${environment.baseApiUrl}/logistica`,
    sales: `${environment.baseApiUrl}/ventas`,
    auth: `${environment.baseApiUrl}/auth`
  };

  /**
   * Get the appropriate base URL based on service type
   */
  private resolveServiceUrl(serviceType?: ServiceType): string | null {
    if (serviceType && this.serviceUrls[serviceType]) {
      return this.serviceUrls[serviceType];
    }

    return null;
  }

  /**
   * Build headers with bearer token from AppStore
   */
  private buildHeaders(options?: ApiRequestOptions): HttpHeaders | { [header: string]: string | string[] } {
    const token = this.appStore.accessToken();
    
    let headers: HttpHeaders | { [header: string]: string | string[] };

    if (options?.headers) {
      if (options.headers instanceof HttpHeaders) {
        headers = options.headers;
      } else {
        headers = { ...options.headers };
      }
    } else {
      headers = {};
    }

    // Add Authorization header if token exists
    if (token) {
      if (headers instanceof HttpHeaders) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Perform a GET request
   */
  get<T>(endpoint: string, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    const headers = this.buildHeaders(options);
    
    return this.http
      .get<T>(`${baseUrl}${endpoint}`, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a POST request
   */
  post<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    const headers = this.buildHeaders(options);
    
    return this.http
      .post<T>(`${baseUrl}${endpoint}`, body, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a PUT request
   */
  put<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    const headers = this.buildHeaders(options);
    
    return this.http
      .put<T>(`${baseUrl}${endpoint}`, body, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a PATCH request
   */
  patch<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    const headers = this.buildHeaders(options);
    
    return this.http
      .patch<T>(`${baseUrl}${endpoint}`, body, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a DELETE request
   */
  delete<T>(endpoint: string, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    const headers = this.buildHeaders(options);
    
    return this.http
      .delete<T>(`${baseUrl}${endpoint}`, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Build query parameters from an object
   */
  buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Set the base URL (useful for switching between environments)
   */
  setBaseUrl(url: string): void {
    this.serviceUrls['default'] = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string | null {
    return this.serviceUrls['default'] || null;
  }

  /**
   * Set a specific service URL
   */
  setServiceUrl(serviceType: ServiceType, url: string): void {
    this.serviceUrls[serviceType] = url;
  }

  /**
   * Get a specific service URL
   */
  getServiceUrl(serviceType: ServiceType): string | null {
    return this.serviceUrls[serviceType] || null;
  }
}
