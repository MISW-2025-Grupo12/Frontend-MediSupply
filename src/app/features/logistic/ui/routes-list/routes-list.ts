import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { Route as LogisticRoute } from '../../../../shared/models/route.model';
import { AppUser } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-routes-list',
  imports: [CommonModule, TranslocoDirective, RouterLink, DatePipe],
  templateUrl: './routes-list.html'
})
export class RoutesList {
  private readonly transloco = inject(TranslocoService);

  readonly routes = input<LogisticRoute[]>([]);
  readonly routesLoading = input<boolean>(false);
  readonly deliveryUsers = input<AppUser[]>([]);

  getRouteDetailLink(routeId: LogisticRoute['id']): (string | number)[] {
    const activeLang = this.transloco.getActiveLang();
    const detailPath = activeLang?.toLowerCase().startsWith('es') ? 'detalle-ruta' : 'route-detail';

    return [detailPath, routeId];
  }

  getDriverName(driverId: LogisticRoute['driverId']): string | number {
    const normalizedId = String(driverId);
    const driver = this.deliveryUsers().find((user) => String(user.id) === normalizedId);

    return driver?.name ?? driverId;
  }

  shortId(value: LogisticRoute['id']): string {
    if (value === null || value === undefined) {
      return '';
    }

    const id = String(value);
    return id.length <= 6 ? id : id.slice(-6);
  }
}
