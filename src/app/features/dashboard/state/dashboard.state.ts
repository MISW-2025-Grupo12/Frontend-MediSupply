import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore } from '../../../core/state/app.store';
import { LocaleRouteService } from '../../../core/services/locale-route.service';

export interface DashboardCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  route: string;
  color: string;
  enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardState {
  private appStore = inject(AppStore);
  private router = inject(Router);
  private localeRouteService = inject(LocaleRouteService);

  // State signals
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _availableFeatures = signal<DashboardCard[]>([
    {
      id: 'products',
      titleKey: 'dashboard.cards.products.title',
      descriptionKey: 'dashboard.cards.products.description',
      icon: 'inventory_2',
      route: 'products',
      color: '#646116',
      enabled: true
    },
    {
      id: 'logistic',
      titleKey: 'dashboard.cards.logistic.title',
      descriptionKey: 'dashboard.cards.logistic.description',
      icon: 'local_shipping',
      route: 'logistic',
      color: '#0ea5e9',
      enabled: true
    },
    {
      id: 'sales',
      titleKey: 'dashboard.cards.sales.title',
      descriptionKey: 'dashboard.cards.sales.description',
      icon: 'point_of_sale',
      route: 'sales',
      color: '#8b5cf6',
      enabled: true
    },
    {
      id: 'clients',
      titleKey: 'dashboard.cards.clients.title',
      descriptionKey: 'dashboard.cards.clients.description',
      icon: 'people',
      route: 'clients',
      color: '#3b82f6',
      enabled: false // Coming soon
    },
    {
      id: 'orders',
      titleKey: 'dashboard.cards.orders.title',
      descriptionKey: 'dashboard.cards.orders.description',
      icon: 'shopping_cart',
      route: 'orders',
      color: '#10b981',
      enabled: false // Coming soon
    },
    {
      id: 'users',
      titleKey: 'dashboard.cards.users.title',
      descriptionKey: 'dashboard.cards.users.description',
      icon: 'people_alt',
      route: 'users',
      color: '#f59e0b',
      enabled: false
    },
  ]);

  // Computed values
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly availableFeatures = computed(() => this._availableFeatures());
  readonly enabledFeatures = computed(() => 
    this._availableFeatures().filter(f => f.enabled)
  );
  readonly user = computed(() => this.appStore.user());
  readonly userName = computed(() => this.appStore.user()?.name || '');
  readonly userRole = computed(() => this.appStore.user()?.role || 'user');

  // Actions
  navigateToFeature(card: DashboardCard): void {
    if (!card.enabled) {
      return;
    }
    this.localeRouteService.navigateToRoute(card.route);
  }

  logout(): void {
    this.appStore.setUser(null);
    this.localeRouteService.navigateToRoute('login');
  }

  refreshDashboard(): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    // Simulate loading dashboard data
    setTimeout(() => {
      this._isLoading.set(false);
    }, 500);
  }
}
