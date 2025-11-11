import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';

@Component({
  selector: 'app-logistic-page',
  imports: [TranslocoDirective, RouterLink, MatButtonModule, MatIconModule, UnassignedDeliveries],
  templateUrl: './logistic-page.html',
  styleUrl: './logistic-page.scss'
})
export class LogisticPage implements OnInit {
  private logisticStore = inject(LogisticStore);

  ngOnInit(): void {
    this.logisticStore.loadMockDeliveries();
  }

  readonly deliveries = this.logisticStore.deliveries;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
}
