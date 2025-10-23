import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';
import { AuthStore } from '../../../state/auth.store';
import { LoginForm, LoginCredentials } from '../../../ui/login-form/login-form';

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

  onLogin(credentials: LoginCredentials): void {
    console.log('Login attempt:', credentials);
    this.authStore.login(credentials.email, credentials.password);
  }

  navigateToRegister(): void {
    this.authStore.navigateToRegister();
  }
}
