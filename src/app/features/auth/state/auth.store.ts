import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AppUser } from "../../../shared/models/user.model";
import { AppStore } from "../../../core/state/app.store";
import { LocaleRouteService } from "../../../core/services/locale-route.service";
import { UserType } from "../../../shared/enums/user-type";

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);

  login(email: string, password: string) {
    this.appStore.setApiBusy(true);

    // Simulate API call
    setTimeout(() => {
      // Set user data
      this.appStore.setUser({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        legalId: '12345678',
        phone: '1234567890',
        address: '123 Main St',
        role: UserType.ADMIN
      });
      
      this.appStore.setApiBusy(false);
      
      // Navigate to dashboard after successful login
      this.localeRouteService.navigateToRoute('dashboard');
    }, 1000);
  }

  logout() {
    this.appStore.setUser(null);
    this.localeRouteService.navigateToRoute('login');
  }

  navigateToRegister(): void {
    this.localeRouteService.navigateToRoute('register');
  }
}
