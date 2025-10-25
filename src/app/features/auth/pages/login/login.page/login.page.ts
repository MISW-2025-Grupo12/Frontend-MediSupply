import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';
import { AuthStore } from '../../../state/auth.store';
import { LoginForm, LoginCredentials } from '../../../ui/login-form/login-form';
import { AppStore } from '../../../../../core/state/app.store';

@Component({
  selector: 'app-login.page',
  imports: [
    CommonModule,
    TranslocoDirective,
    LoginForm
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private authStore = inject(AuthStore);
  private appStore = inject(AppStore);

  // Expose the API busy state and error state to the template
  readonly isLoading = this.appStore.apiBusy;
  readonly error = this.appStore.error;

  onLogin(credentials: LoginCredentials): void {
    console.log('Login attempt:', credentials);
    this.authStore.login(credentials.email, credentials.password);
  }

  onInputChange(): void {
    // Clear error when user starts typing
    this.appStore.setError(null);
  }

  navigateToRegister(): void {
    this.authStore.navigateToRegister();
  }

}
