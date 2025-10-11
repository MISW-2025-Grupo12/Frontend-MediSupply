import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  withCredentials?: boolean;
}

export type ServiceType = 'default' | 'users' | 'products';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient);
  private baseUrl = environment.usersApiUrl || 'http://localhost:3000/api';
  
  // Service URL mappings
  private serviceUrls: Record<string, string> = {
    default: environment.usersApiUrl || 'http://localhost:3000/api',
    users: environment.usersApiUrl || 'http://localhost:3000/api',
    products: environment.productsApiUrl || 'http://localhost:3000/api'
  };

  /**
   * Get the appropriate base URL based on service type
   */
  private resolveServiceUrl(serviceType?: ServiceType): string {
    if (serviceType && this.serviceUrls[serviceType]) {
      return this.serviceUrls[serviceType];
    }
    return this.baseUrl;
  }

  /**
   * Perform a GET request
   */
  get<T>(endpoint: string, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    
    return this.http
      .get<T>(`${baseUrl}${endpoint}`, { ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a POST request
   */
  post<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    
    return this.http
      .post<T>(`${baseUrl}${endpoint}`, body, { ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a PUT request
   */
  put<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    
    return this.http
      .put<T>(`${baseUrl}${endpoint}`, body, { ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a PATCH request
   */
  patch<T>(endpoint: string, body: any, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    
    return this.http
      .patch<T>(`${baseUrl}${endpoint}`, body, { ...options })
      .pipe(catchError(this.handleError));
  }

  /**
   * Perform a DELETE request
   */
  delete<T>(endpoint: string, serviceType?: ServiceType, options?: ApiRequestOptions): Observable<T> {
    const baseUrl = this.resolveServiceUrl(serviceType);
    
    return this.http
      .delete<T>(`${baseUrl}${endpoint}`, { ...options })
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
    this.baseUrl = url;
    this.serviceUrls['default'] = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
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
  getServiceUrl(serviceType: ServiceType): string {
    return this.serviceUrls[serviceType] || this.baseUrl;
  }
}
