import { computed, inject, Injectable, signal } from '@angular/core';
import { LocaleRouteService } from '../../../core/services/locale-route.service';
import { AppUser } from '../../../shared/models/user.model';
import { UsersService } from '../services/users.service';

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private localeRouteService = inject(LocaleRouteService);
  private usersService = inject(UsersService);
  
  private _users = signal<AppUser[]>([]);

  readonly users = computed(() => this._users());

  loadUsers(): void {
    this.usersService.getUsers().subscribe(users => {
      this._users.set(users);
    });
  }

  navigateToUsers(): void {
    this.localeRouteService.navigateToRoute('users');
  }
}
