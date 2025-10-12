import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoDirective } from '@ngneat/transloco';
import { DashboardState } from '../../../state/dashboard.state';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  dashboardState = inject(DashboardState);

  ngOnInit(): void {
    this.dashboardState.refreshDashboard();
  }

  onCardClick(card: any): void {
    this.dashboardState.navigateToFeature(card);
  }

  onLogout(): void {
    this.dashboardState.logout();
  }
}
