import { signal, computed, effect, Injectable } from '@angular/core';
import { AppUser } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private _user = signal<AppUser | null>(null);
  private _apiBusy = signal(false);

  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());
  readonly apiBusy = computed(() => this._apiBusy());

  setUser(u: AppUser | null) { this._user.set(u); }
  setApiBusy(v: boolean) { this._apiBusy.set(v); }

  constructor() {
    const raw = localStorage.getItem('meddiSupply-user');
    if (raw) this._user.set(JSON.parse(raw));

    effect(() => {
      const u = this._user();
      u ? localStorage.setItem('meddiSupply-user', JSON.stringify(u)) : localStorage.removeItem('meddiSupply-user');
    });
  }
}
