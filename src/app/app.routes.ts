import { Routes } from '@angular/router';

// Available locales
const LOCALES = ['en', 'es'];

// Create localized routes
const localizedRoutes: Routes = LOCALES.map(locale => ({
  path: locale,
  children: [
    { 
      path: '', 
      redirectTo: locale === 'en' ? 'products' : 'productos', 
      pathMatch: 'full' 
    },
    { 
      path: locale === 'en' ? 'products' : 'productos', 
      loadChildren: () => import('./features/products/shell/products.routes').then(m => m.PRODUCTS_ROUTES),
      data: { titleKey: 'titles.products' }
    }
  ]
}));

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/en', 
    pathMatch: 'full' 
  },
  ...localizedRoutes
];
