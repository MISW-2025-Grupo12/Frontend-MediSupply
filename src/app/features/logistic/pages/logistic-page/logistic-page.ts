import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';
import { Route as LogisticRoute } from '../../../../shared/models/route.model';

@Component({
  selector: 'app-logistic-page',
  imports: [CommonModule, TranslocoDirective, RouterLink, MatButtonModule, MatIconModule, UnassignedDeliveries],
  templateUrl: './logistic-page.html',
  styleUrl: './logistic-page.scss'
})
export class LogisticPage implements OnInit {
  private logisticStore = inject(LogisticStore);
  private transloco = inject(TranslocoService);

  ngOnInit(): void {
    if (!this.routes().length) {
      this.logisticStore.loadRoutes();
    }

    if (!this.deliveries().length) {
      this.logisticStore.loadMockDeliveries();
    }
  }

  readonly deliveries = this.logisticStore.deliveries;
  readonly routes = this.logisticStore.routes;
  readonly routesLoading = this.logisticStore.routesLoading;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;

  getRouteDetailLink(routeId: LogisticRoute['id']): (string | number)[] {
    const activeLang = this.transloco.getActiveLang();
    const detailPath = activeLang?.toLowerCase().startsWith('es') ? 'detalle-ruta' : 'route-detail';

    return [detailPath, routeId];
  }
}
