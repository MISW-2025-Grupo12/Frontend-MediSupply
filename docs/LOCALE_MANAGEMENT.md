# Gestión de Locale (Idioma)

## 📋 Descripción

El sistema de gestión de locale en MediSupply utiliza **Angular Signals** a través del `AppStore` para mantener el estado del idioma seleccionado de manera centralizada y persistente.

## 🎯 Características

- ✅ **Estado centralizado**: Gestión mediante `AppStore`
- ✅ **Persistencia**: Almacenamiento automático en `localStorage`
- ✅ **Reactividad**: Uso de Angular Signals
- ✅ **Sincronización**: Sincronización automática con URL y Transloco
- ✅ **Type-safe**: TypeScript con tipos estrictos

## 🗂️ Arquitectura

```
AppStore (Estado Global)
    ↓
LocaleRouteService (Gestión de Rutas)
    ↓
Componentes (Consumo del Estado)
```

## 🔧 Configuración

### AppStore

El `AppStore` gestiona el estado del locale:

```typescript
// src/app/core/state/app.store.ts

export class AppStore {
  private _locale = signal<SupportedLocale>('en');
  
  // Computed values
  readonly locale = computed(() => this._locale());
  readonly isEnglish = computed(() => this._locale() === 'en');
  readonly isSpanish = computed(() => this._locale() === 'es');
  
  // Actions
  setLocale(locale: SupportedLocale) { ... }
  toggleLocale() { ... }
}
```

### Idiomas Soportados

```typescript
type SupportedLocale = 'en' | 'es';

const SUPPORTED_LOCALES = ['en', 'es'];
const DEFAULT_LOCALE = 'en';
```

## 💻 Uso en Componentes

### 1. Inyección del Store

```typescript
import { Component, inject } from '@angular/core';
import { AppStore } from '@core/state/app.store';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent {
  appStore = inject(AppStore);
}
```

### 2. Leer el Locale Actual

```typescript
// En el template
<div>
  <p>Current language: {{ appStore.locale() }}</p>
  <p *ngIf="appStore.isEnglish()">English is active</p>
  <p *ngIf="appStore.isSpanish()">Español está activo</p>
</div>

// En el código TypeScript
const currentLocale = this.appStore.locale();
console.log('Current locale:', currentLocale); // 'en' o 'es'

const isEnglish = this.appStore.isEnglish();
const isSpanish = this.appStore.isSpanish();
```

### 3. Cambiar el Locale

#### Opción A: Usar LocaleRouteService (Recomendado)

```typescript
import { LocaleRouteService } from '@core/services/locale-route.service';

export class MyComponent {
  localeRouteService = inject(LocaleRouteService);

  changeLanguage(newLocale: string) {
    // Cambia el idioma y actualiza la URL automáticamente
    this.localeRouteService.changeLanguage(newLocale);
  }

  toggleLanguage() {
    const newLang = this.appStore.locale() === 'en' ? 'es' : 'en';
    this.localeRouteService.changeLanguage(newLang);
  }
}
```

#### Opción B: Usar AppStore directamente

```typescript
export class MyComponent {
  appStore = inject(AppStore);

  changeLanguage(locale: 'en' | 'es') {
    // Solo actualiza el estado, no la URL
    this.appStore.setLocale(locale);
  }

  toggleLanguage() {
    // Alterna entre inglés y español
    this.appStore.toggleLocale();
  }
}
```

## 🔄 Sincronización Automática

### URL → AppStore

Cuando el usuario navega a una URL con prefijo de idioma, el sistema automáticamente:

1. Detecta el locale de la URL (`/es/products`, `/en/products`)
2. Actualiza el `AppStore` con el locale detectado
3. Sincroniza Transloco con el nuevo locale

```typescript
// Esto sucede automáticamente en LocaleRouteService
getCurrentLocale(): string {
  const detectedLocale = this.extractLocaleFromUrl();
  
  // Sincronización automática con AppStore
  if (this.appStore.locale() !== detectedLocale) {
    this.appStore.setLocale(detectedLocale);
  }
  
  return detectedLocale;
}
```

### AppStore → localStorage

Los cambios en el locale se persisten automáticamente:

```typescript
// En AppStore constructor
effect(() => {
  const locale = this._locale();
  localStorage.setItem('meddiSupply-locale', locale);
});
```

### localStorage → AppStore (Inicialización)

Al cargar la aplicación, se restaura el locale guardado:

```typescript
// En AppStore constructor
const savedLocale = localStorage.getItem('meddiSupply-locale');
if (savedLocale && this.SUPPORTED_LOCALES.includes(savedLocale)) {
  this._locale.set(savedLocale);
}
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Header con Selector de Idioma

```typescript
@Component({
  selector: 'app-header',
  template: `
    <header>
      <button (click)="switchLanguage()">
        {{ appStore.locale() === 'en' ? '🇬🇧' : '🇪🇸' }}
        {{ appStore.locale().toUpperCase() }}
      </button>
    </header>
  `
})
export class Header {
  appStore = inject(AppStore);
  localeRouteService = inject(LocaleRouteService);

  switchLanguage() {
    const newLang = this.appStore.locale() === 'en' ? 'es' : 'en';
    this.localeRouteService.changeLanguage(newLang);
  }
}
```

### Ejemplo 2: Componente con Contenido Localizado

```typescript
@Component({
  template: `
    <div *transloco="let t">
      <h1>{{ t('title') }}</h1>
      
      <!-- Mostrar información basada en el locale -->
      <p *ngIf="appStore.isEnglish()">
        Date format: MM/DD/YYYY
      </p>
      <p *ngIf="appStore.isSpanish()">
        Formato de fecha: DD/MM/YYYY
      </p>
    </div>
  `
})
export class LocalizedComponent {
  appStore = inject(AppStore);
  
  formatDate(date: Date): string {
    // Formatear según el locale actual
    const locale = this.appStore.locale();
    return new Intl.DateTimeFormat(locale).format(date);
  }
}
```

### Ejemplo 3: Guard con Verificación de Locale

```typescript
export const localeGuard: CanActivateFn = (route) => {
  const appStore = inject(AppStore);
  const router = inject(Router);
  
  const currentLocale = appStore.locale();
  const urlLocale = route.paramMap.get('locale');
  
  // Verificar que el locale en la URL coincida con el estado
  if (urlLocale && urlLocale !== currentLocale) {
    appStore.setLocale(urlLocale as 'en' | 'es');
  }
  
  return true;
};
```

## 🎨 UI/UX Patterns

### Dropdown de Idiomas

```typescript
@Component({
  template: `
    <mat-select 
      [value]="appStore.locale()" 
      (selectionChange)="changeLanguage($event.value)">
      <mat-option value="en">🇬🇧 English</mat-option>
      <mat-option value="es">🇪🇸 Español</mat-option>
    </mat-select>
  `
})
export class LanguageSelector {
  appStore = inject(AppStore);
  localeRouteService = inject(LocaleRouteService);
  
  changeLanguage(locale: string) {
    this.localeRouteService.changeLanguage(locale);
  }
}
```

### Toggle Button

```typescript
@Component({
  template: `
    <button 
      mat-raised-button 
      (click)="toggleLanguage()"
      class="language-toggle">
      <mat-icon>translate</mat-icon>
      {{ appStore.locale() === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés' }}
    </button>
  `
})
export class LanguageToggle {
  appStore = inject(AppStore);
  localeRouteService = inject(LocaleRouteService);
  
  toggleLanguage() {
    this.appStore.toggleLocale();
    this.localeRouteService.changeLanguage(this.appStore.locale());
  }
}
```

## 🔍 Debugging

### Ver el Estado Actual

```typescript
// En cualquier componente
console.log('Current locale:', this.appStore.locale());
console.log('Is English:', this.appStore.isEnglish());
console.log('Is Spanish:', this.appStore.isSpanish());
console.log('Supported locales:', this.appStore.supportedLocales());
```

### Verificar localStorage

```typescript
// En la consola del navegador
localStorage.getItem('meddiSupply-locale'); // 'en' o 'es'
```

### Limpiar localStorage

```typescript
// Para resetear el locale guardado
localStorage.removeItem('meddiSupply-locale');
```

## ⚠️ Consideraciones Importantes

### 1. Prioridad de Locale

La prioridad al determinar el locale es:
1. **URL** - El locale en la ruta actual
2. **localStorage** - El locale guardado previamente
3. **Default** - El locale por defecto ('en')

### 2. Sincronización con Transloco

Siempre usa `LocaleRouteService.changeLanguage()` para cambiar el idioma, ya que:
- Actualiza el AppStore
- Actualiza Transloco
- Navega a la URL correcta
- Traduce las rutas automáticamente

### 3. Type Safety

Siempre usa el tipo `SupportedLocale` al trabajar con locales:

```typescript
// ✅ Correcto
const locale: 'en' | 'es' = 'en';
appStore.setLocale(locale);

// ❌ Incorrecto (error de TypeScript)
appStore.setLocale('fr'); // Error: Type '"fr"' is not assignable
```

## 📚 Recursos Adicionales

- [Documentación de Rutas i18n](./I18N_ROUTES.md)
- [Transloco Documentation](https://ngneat.github.io/transloco/)
- [Angular Signals Documentation](https://angular.dev/guide/signals)

## 🐛 Problemas Comunes

### Problema: El locale no se persiste

**Solución**: Verifica que el navegador permita el uso de localStorage.

### Problema: El locale no coincide con la URL

**Solución**: Asegúrate de usar `LocaleRouteService.changeLanguage()` en lugar de cambiar solo el AppStore.

### Problema: Transloco no se actualiza

**Solución**: Verifica que estés usando `TranslocoService.setActiveLang()` junto con el cambio de locale.

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0

