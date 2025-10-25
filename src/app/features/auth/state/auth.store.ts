import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AppUser } from "../../../shared/models/user.model";
import { AppStore } from "../../../core/state/app.store";
import { LocaleRouteService } from "../../../core/services/locale-route.service";
import { UserType } from "../../../shared/enums/user-type";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);
  private authService = inject(AuthService);

  login(email: string, password: string) {
    this.appStore.setApiBusy(true);

    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.appStore.setApiBusy(false);
        // Navigate to dashboard after successful login
        this.localeRouteService.navigateToRoute('dashboard');
      },
      error: (error) => {
        this.appStore.setApiBusy(false);
        console.error('Login failed:', error);
        // Handle login error (show error message, etc.)
      }
    });
  }

  logout() {
    this.authService.logout();
    this.localeRouteService.navigateToRoute('login');
  }

  navigateToRegister(): void {
    this.localeRouteService.navigateToRoute('register');
  }
}
