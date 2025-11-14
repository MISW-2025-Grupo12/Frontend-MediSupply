import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';
import { RoutesList } from '../../ui/routes-list/routes-list';
import { UsersStore } from '../../../users/state/users.store';

@Component({
  selector: 'app-logistic-page',
  imports: [CommonModule, TranslocoDirective, RouterLink, MatButtonModule, MatIconModule, RoutesList, UnassignedDeliveries],
  templateUrl: './logistic-page.html',
  styleUrl: './logistic-page.scss'
})
export class LogisticPage implements OnInit {
  private logisticStore = inject(LogisticStore);
  private usersStore = inject(UsersStore);

  ngOnInit(): void {
    if (!this.routes().length) {
      this.logisticStore.loadRoutes();
    }

    if (!this.deliveries().length) {
      this.logisticStore.loadUnassignedDeliveries();
    }

    if (!this.deliveryUsers().length) {
      this.usersStore.loadDeliveryUsers();
    }
  }

  readonly deliveries = this.logisticStore.deliveries;
  readonly routes = this.logisticStore.routes;
  readonly routesLoading = this.logisticStore.routesLoading;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
  readonly deliveryUsers = this.usersStore.deliveryUsers;
}
