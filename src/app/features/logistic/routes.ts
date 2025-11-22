import { Routes } from '@angular/router';
import { AddRoute } from './pages/add-route/add-route';
import { LogisticPage } from './pages/logistic-page/logistic-page';
import { RouteDetail } from './pages/route-detail/route-detail';
import { roleGuard } from '../../core/guards/role.guard';
import { UserType } from '../../shared/enums/user-type';

export const LOGISTIC_ROUTES: Routes = [
  {
    path: '',
    component: LogisticPage,
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'add-route',
    component: AddRoute,
    canActivate: [roleGuard([UserType.ADMIN])],
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'anadir-ruta',
    component: AddRoute,
    canActivate: [roleGuard([UserType.ADMIN])],
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'route-detail/:id',
    component: RouteDetail,
    data: { titleKey: 'titles.logistic' }
  },
  {
    path: 'detalle-ruta/:id',
    component: RouteDetail,
    data: { titleKey: 'titles.logistic' }
  }
];
