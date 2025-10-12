import { signal, computed, effect, Injectable } from '@angular/core';
import { AppUser } from '../../shared/models/user.model';

type SupportedLocale = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class AppStore {
  // User state
  private _user = signal<AppUser | null>(null);
  private _apiBusy = signal(false);

  // Locale state
  private _locale = signal<SupportedLocale>('en');
  
  // Locale configuration
  private readonly SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es'];
  private readonly DEFAULT_LOCALE: SupportedLocale = 'en';
  private readonly LOCALE_STORAGE_KEY = 'meddiSupply-locale';
  private readonly USER_STORAGE_KEY = 'meddiSupply-user';

  // User computed values
  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());
  readonly apiBusy = computed(() => this._apiBusy());

  // Locale computed values
  readonly locale = computed(() => this._locale());
  readonly supportedLocales = computed(() => this.SUPPORTED_LOCALES);
  readonly isEnglish = computed(() => this._locale() === 'en');
  readonly isSpanish = computed(() => this._locale() === 'es');

  // User actions
  setUser(u: AppUser | null) { this._user.set(u); }
  setApiBusy(v: boolean) { this._apiBusy.set(v); }

  // Locale actions
  setLocale(locale: SupportedLocale) {
    if (this.SUPPORTED_LOCALES.includes(locale)) {
      this._locale.set(locale);
    } else {
      console.warn(`Locale ${locale} is not supported. Using default: ${this.DEFAULT_LOCALE}`);
      this._locale.set(this.DEFAULT_LOCALE);
    }
  }

  toggleLocale() {
    const newLocale = this._locale() === 'en' ? 'es' : 'en';
    this.setLocale(newLocale);
  }

  constructor() {
    // Load user from localStorage
    const rawUser = localStorage.getItem(this.USER_STORAGE_KEY);
    if (rawUser) {
      try {
        this._user.set(JSON.parse(rawUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }

    // Load locale from localStorage
    const savedLocale = localStorage.getItem(this.LOCALE_STORAGE_KEY) as SupportedLocale;
    if (savedLocale && this.SUPPORTED_LOCALES.includes(savedLocale)) {
      this._locale.set(savedLocale);
    }

    // Persist user changes to localStorage
    effect(() => {
      const u = this._user();
      if (u) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    });

    // Persist locale changes to localStorage
    effect(() => {
      const locale = this._locale();
      localStorage.setItem(this.LOCALE_STORAGE_KEY, locale);
    });
  }
}
