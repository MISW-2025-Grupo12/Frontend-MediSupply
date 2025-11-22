import { Routes } from '@angular/router';

/**
 * Minimal route configuration for testing
 * Provides catch-all routes to prevent routing errors during tests
 */
export const TEST_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/es/login',
    pathMatch: 'full'
  },
  {
    path: ':locale',
    children: [
      {
        path: 'login',
        component: {} as any
      },
      {
        path: 'registrarse',
        component: {} as any
      },
      {
        path: 'register',
        component: {} as any
      },
      {
        path: 'dashboard',
        component: {} as any
      },
      {
        path: 'panel',
        component: {} as any
      },
      {
        path: 'products',
        component: {} as any
      },
      {
        path: 'productos',
        component: {} as any
      },
      {
        path: 'logistic',
        component: {} as any
      },
      {
        path: 'logistica',
        component: {} as any
      },
      {
        path: 'sales',
        component: {} as any
      },
      {
        path: 'ventas',
        component: {} as any
      },
      {
        path: 'users',
        component: {} as any
      },
      {
        path: 'usuarios',
        component: {} as any
      },
      {
        path: 'sales-report',
        component: {} as any
      },
      {
        path: 'reportes-de-ventas',
        component: {} as any
      },
      {
        path: 'sales-plan',
        component: {} as any
      },
      {
        path: 'plan-de-ventas',
        component: {} as any
      },
      {
        path: 'add-sales-plan',
        component: {} as any
      },
      {
        path: 'anadir-plan-de-ventas',
        component: {} as any
      },
      {
        path: 'add',
        component: {} as any
      },
      {
        path: 'anadir',
        component: {} as any
      },
      {
        path: 'clients',
        component: {} as any
      },
      {
        path: 'clientes',
        component: {} as any
      },
      {
        path: 'orders',
        component: {} as any
      },
      {
        path: 'pedidos',
        component: {} as any
      },
      {
        path: 'add-user',
        component: {} as any
      },
      {
        path: 'anadir-usuario',
        component: {} as any
      },
      {
        path: '**',
        component: {} as any
      }
    ]
  },
  {
    path: '**',
    component: {} as any
  }
];

