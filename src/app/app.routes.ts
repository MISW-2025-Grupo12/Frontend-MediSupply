import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserType } from './shared/enums/user-type';

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
      path: locale === 'en' ? 'logistic' : 'logistica', 
      loadChildren: () => import('./features/logistic/routes').then(m => m.LOGISTIC_ROUTES),
      canActivate: [authGuard, roleGuard([UserType.ADMIN, UserType.DELIVERY])],
      data: { titleKey: 'titles.logistic' }
    },
    { 
      path: locale === 'en' ? 'sales' : 'ventas', 
      loadChildren: () => import('./features/sales/routes').then(m => m.SALES_ROUTES),
      canActivate: [authGuard, roleGuard([UserType.SELLER, UserType.ADMIN])],
      data: { titleKey: 'titles.sales' }
    },
    { 
      path: locale === 'en' ? 'users' : 'usuarios', 
      loadChildren: () => import('./features/users/routes').then(m => m.USERS_ROUTES),
      canActivate: [authGuard],
      data: { titleKey: 'titles.users' }
    },
    { 
      path: 'login', 
      loadChildren: () => import('./features/auth/routes').then(m => m.LOGIN_ROUTES),
      canActivate: [guestGuard],
      data: { titleKey: 'titles.login' }
    },
    { 
      path: locale === 'en' ? 'register' : 'registrarse', 
      loadChildren: () => import('./features/auth/routes').then(m => m.REGISTER_ROUTES),
      canActivate: [guestGuard],
      data: { titleKey: 'titles.register' }
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
