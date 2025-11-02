import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { RegisterForm, RegisterData } from '../../ui/register-form/register-form';
import { AuthService } from '../../services/auth.service';
import { AppUser } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-register-page',
  imports: [TranslocoModule, RegisterForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss'
})
export class RegisterPage {
  private localeRouteService = inject(LocaleRouteService);
  private authService = inject(AuthService);

  navigateToLogin(): void {
    this.localeRouteService.navigateToRoute('login');
  }

  onRegister(registerData: RegisterData): void {
    // Convert RegisterData to AppUser
    const appUser: AppUser = {
      id: '', // Will be set by the backend
      name: registerData.name,
      email: registerData.email,
      legalId: registerData.dni,
      phone: registerData.phone,
      address: registerData.address,
      password: registerData.password,
      role: registerData.role
    };

    // Call the auth service to create the user
    this.authService.createUser(appUser).subscribe({
      next: (user) => {
        console.log('User created successfully:', user);
        // Navigate to login page after successful registration (user must log in manually)
        this.localeRouteService.navigateToRoute('login');
      },
      error: (error) => {
        console.error('Registration failed:', error);
        // TODO: Show error message to user
      }
    });
  }
}
