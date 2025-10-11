# Internationalized Routes (i18n)

## Overview

This application now supports internationalized routes with locale-specific URLs and page titles. The implementation allows for URLs like:
- English: `/en/products`, `/en/products/create`
- Spanish: `/es/productos`, `/es/productos/crear`

## Features

1. **Localized URL Paths**: Route paths are translated based on the active language
2. **Localized Page Titles**: Page titles automatically update based on language and route
3. **Smart Language Switching**: When users change language, they stay on the same page with translated URL
4. **SEO-Friendly**: Each language has its own URL for better search engine indexing

## How It Works

### 1. Route Configuration (`app.routes.ts`)

Routes are configured with locale prefixes. Each supported locale has its own set of translated route paths.

### 2. Translation Files

Route paths and page titles are defined in the translation files:

**en.json:**
```json
{
  "routes": {
    "products": "products",
    "clients": "clients",
    "create": "create"
  },
  "titles": {
    "products": "Products - MediSupply",
    "createProduct": "Create Product - MediSupply",
    "home": "MediSupply"
  }
}
```

**es.json:**
```json
{
  "routes": {
    "products": "productos",
    "clients": "clientes",
    "create": "crear"
  },
  "titles": {
    "products": "Productos - MediSupply",
    "createProduct": "Crear Producto - MediSupply",
    "home": "MediSupply"
  }
}
```

### 3. Feature Routes (`products.routes.ts`)

Child routes within features can also have localized paths and titles:

```typescript
export const PRODUCTS_ROUTES: Routes = [
  { 
    path: '', 
    component: Products,
    data: { titleKey: 'titles.products' }
  },
  { 
    path: 'create', 
    component: CreateProduct,
    data: { titleKey: 'titles.createProduct' }
  },
  { 
    path: 'crear', 
    component: CreateProduct,
    data: { titleKey: 'titles.createProduct' }
  }
];
```

### 4. LocaleRouteService

The `LocaleRouteService` provides helper methods for:
- Getting the current locale from the URL
- Navigating to localized routes
- Changing the language and updating the URL
- Getting localized URLs for links

### 5. I18nTitleStrategy

A custom `TitleStrategy` that automatically sets page titles based on the route's `data.titleKey` property. It:
- Reads the `titleKey` from route data
- Translates the title using Transloco
- Updates the browser tab title automatically
- Responds to language changes in real-time

## Usage Examples

### In Components

```typescript
import { LocaleRouteService } from '@core/services/locale-route.service';

export class MyComponent {
  private localeRouteService = inject(LocaleRouteService);

  // Navigate to a localized route
  navigateToProducts(): void {
    this.localeRouteService.navigateToRoute('products');
  }

  // Change language
  switchToSpanish(): void {
    this.localeRouteService.changeLanguage('es');
  }

  // Get current locale
  getCurrentLocale(): string {
    return this.localeRouteService.getCurrentLocale();
  }
}
```

### In Templates

```html
<!-- Using routerLink with localized URLs -->
<a [routerLink]="getProductsRoute()">Products</a>

<!-- Component method -->
getProductsRoute(): string {
  return this.localeRouteService.getLocalizedUrl('products');
}
```

### Language Switching

When users switch languages, the `LocaleRouteService.changeLanguage()` method:
1. Updates the Transloco active language
2. Translates the current route path to the new language
3. Navigates to the new localized URL

Example:
- User is on: `/en/products`
- User switches to Spanish
- User is redirected to: `/es/productos`

### URL Examples:
- 🇺🇸 English: `http://localhost:4200/en/products`
- 🇪🇸 Spanish: `http://localhost:4200/es/productos`
- 🇺🇸 English (Create): `http://localhost:4200/en/products/create`
- 🇪🇸 Spanish (Create): `http://localhost:4200/es/productos/crear`

### Page Title Examples:
- English Products Page: "Products - MediSupply"
- Spanish Products Page: "Productos - MediSupply"
- English Create Page: "Create Product - MediSupply"
- Spanish Create Page: "Crear Producto - MediSupply"

## Adding New Routes

To add a new route with i18n support:

1. **Add route path to translation files:**

```json
// en.json
{
  "routes": {
    "products": "products",
    "clients": "clients",
    "orders": "orders"  // New route
  }
}

// es.json
{
  "routes": {
    "products": "productos",
    "clients": "clientes",
    "orders": "pedidos"  // New route
  }
}
```

2. **Update `app.routes.ts`:**

```typescript
const localizedRoutes: Routes = LOCALES.map(locale => ({
  path: locale,
  children: [
    // ... existing routes
    { 
      path: locale === 'en' ? 'orders' : 'pedidos', 
      loadChildren: () => import('./features/orders/shell/orders.routes').then(m => m.ORDERS_ROUTES) 
    }
  ]
}));
```

3. **Update `LocaleRouteService.changeLanguage()` method:**

Add the new route key to the `routeKeys` array:

```typescript
const routeKeys = ['products', 'clients', 'orders'];
```

## Supported Locales

Currently supported locales:
- `en` (English) - default
- `es` (Spanish)

To add more locales, update the `LOCALES` array in `app.routes.ts` and add corresponding translation files.

## Benefits

1. **SEO**: Search engines can index different language versions separately
2. **User Experience**: URLs are in the user's language
3. **Shareability**: Users can share language-specific URLs
4. **Bookmarking**: Users can bookmark pages in their preferred language
5. **Deep Linking**: Direct navigation to specific pages in specific languages

## Default Behavior

- Root URL (`/`) redirects to `/en` (English)
- Invalid locales default to English
- Language switching preserves the current page context

