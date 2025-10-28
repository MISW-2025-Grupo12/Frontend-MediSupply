import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Header } from './core/layout/header/header';
import { Footer } from './core/layout/footer/footer';
import { AppStore } from './core/state/app.store';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('medi-supply');
  private appStore = inject(AppStore);
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  
  // Show header only when logged in
  protected readonly showHeader = computed(() => this.appStore.isLoggedIn());
  
  constructor() {
    // Listen to route changes to check if user is on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.initializeLocaleFromUrl(event.url);
    });
  }
  
  ngOnInit(): void {
    // Initialize locale on app startup
    this.initializeLocaleFromUrl(this.router.url);
  }
  
  private initializeLocaleFromUrl(url: string): void {
    const urlSegments = url.split('/').filter(s => s);
    const locale = urlSegments[0] && ['en', 'es'].includes(urlSegments[0]) ? urlSegments[0] : 'es';
    
    if (locale !== this.translocoService.getActiveLang()) {
      this.translocoService.setActiveLang(locale);
    }
  }
}
