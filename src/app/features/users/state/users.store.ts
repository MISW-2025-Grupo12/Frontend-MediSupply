import { computed, inject, Injectable, signal } from '@angular/core';
import { LocaleRouteService } from '../../../core/services/locale-route.service';
import { AppUser } from '../../../shared/models/user.model';
import { UsersService } from '../services/users.service';

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private localeRouteService = inject(LocaleRouteService);
  private usersService = inject(UsersService);
  private _users = signal<AppUser[]>([]);
  private _deliveryUsers = signal<AppUser[]>([]);
  private _isLoadingDeliveryUsers = signal(false);

  readonly users = computed(() => this._users());
  readonly deliveryUsers = computed(() => this._deliveryUsers());
  readonly isLoadingDeliveryUsers = computed(() => this._isLoadingDeliveryUsers());

  loadUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this._users.set(users);
    });
  }

  loadDeliveryUsers(): void {
    this._isLoadingDeliveryUsers.set(true);

    this.usersService.getDeliveryUsers().subscribe({
      next: ({ items }) => {
        this._deliveryUsers.set(items ?? []);
        this._isLoadingDeliveryUsers.set(false);
      },
      error: (error) => {
        console.error('Failed to load delivery users.', error);
        this._deliveryUsers.set([]);
        this._isLoadingDeliveryUsers.set(false);
      }
    });
  }

  navigateToUsers(): void {
    this.localeRouteService.navigateToRoute('users');
  }
}
