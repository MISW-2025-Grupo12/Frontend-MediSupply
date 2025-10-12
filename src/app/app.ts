import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Header } from './core/layout/header/header';
import { AppStore } from './core/state/app.store';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('medi-supply');
  private appStore = inject(AppStore);
  private router = inject(Router);
  
  // Show header only when logged in
  protected readonly showHeader = computed(() => this.appStore.isLoggedIn());
  
  constructor() {
    // Listen to route changes to check if user is on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Additional logic if needed
    });
  }
}
