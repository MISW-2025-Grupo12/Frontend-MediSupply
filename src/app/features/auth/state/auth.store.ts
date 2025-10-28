import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AppStore } from "../../../core/state/app.store";
import { LocaleRouteService } from "../../../core/services/locale-route.service";
import { UserType } from "../../../shared/enums/user-type";
import { AuthService } from "../services/auth.service";
import { catchError, finalize, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);
  private authService = inject(AuthService);

  login(email: string, password: string) {
    this.appStore.setApiBusy(true);
    this.appStore.setError(null); // Clear any previous errors

    this.authService.login(email, password)
      .pipe(
        tap(user => {
          // User and token are already set in AppStore by AuthService
          // Clear any errors on successful login
          this.appStore.setError(null);
          // Navigate to dashboard after successful login
          this.localeRouteService.navigateToRoute('dashboard');
        }),
        catchError(error => {
          console.error('Login failed:', error);
          // Set error message in AppStore for display
          const errorMessage = this.getErrorMessage(error);
          this.appStore.setError(errorMessage);
          // Return empty observable to prevent further error propagation
          return [];
        }),
        finalize(() => {
          this.appStore.setApiBusy(false);
        })
      )
      .subscribe();
  }

  logout() {
    this.authService.logout();
    this.localeRouteService.navigateToRoute('login');
  }

  navigateToRegister(): void {
    this.localeRouteService.navigateToRoute('register');
  }

  /**
   * Extract user-friendly error message from API error
   */
  private getErrorMessage(error: any): string {
    // Handle different types of errors
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      // Check if it's a technical HTTP error message
      if (error.message.includes('401 UNAUTHORIZED')) {
        return 'Invalid email or password';
      }
      if (error.message.includes('404')) {
        return 'User not found';
      }
      if (error.message.includes('500')) {
        return 'Server error. Please try again later';
      }
      if (error.message.includes('Http failure response')) {
        return 'Connection error. Please check your internet connection';
      }
      return error.message;
    }
    if (error?.status === 401) {
      return 'Invalid email or password';
    }
    if (error?.status === 404) {
      return 'User not found';
    }
    if (error?.status === 500) {
      return 'Server error. Please try again later';
    }
    if (error?.status === 0) {
      return 'Network error. Please check your connection';
    }
    // Default error message
    return 'Login failed. Please try again';
  }
}
