import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

// Available locales
const LOCALES = ['en', 'es'];

// Create localized routes
const localizedRoutes: Routes = LOCALES.map(locale => ({
  path: locale,
  children: [
    { 
      path: locale === 'en' ? 'dashboard' : 'panel', 
      loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES),
      canActivate: [authGuard],
      data: { titleKey: 'titles.dashboard' }
    },
    { 
      path: locale === 'en' ? 'products' : 'productos', 
      loadChildren: () => import('./features/products/routes').then(m => m.PRODUCTS_ROUTES),
      canActivate: [authGuard],
      data: { titleKey: 'titles.products' }
    },
    { 
      path: 'login', 
      loadChildren: () => import('./features/auth/routes').then(m => m.LOGIN_ROUTES),
      canActivate: [guestGuard],
      data: { titleKey: 'titles.login' }
    },
    { 
      path: '', 
      redirectTo: locale === 'en' ? 'dashboard' : 'panel', 
      pathMatch: 'full' 
    }
  ]
}));

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/es/login', 
    pathMatch: 'full' 
  },
  ...localizedRoutes
];
