import { Routes } from '@angular/router';
import { AddRoute } from './pages/add-route/add-route';
import { LogisticPage } from './pages/logistic-page/logistic-page';

export const LOGISTIC_ROUTES: Routes = [
  {
    path: '',
    component: LogisticPage,
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'add-route',
    component: AddRoute,
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'anadir-ruta',
    component: AddRoute,
    data: { titleKey: 'titles.logistic' }
  }
];
