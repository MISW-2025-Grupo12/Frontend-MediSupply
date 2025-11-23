import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { AppStore } from '../../../../core/state/app.store';
import { UserType } from '../../../../shared/enums/user-type';

@Component({
  selector: 'app-sales-options',
  imports: [CommonModule, TranslocoDirective, MatIconModule],
  templateUrl: './sales-options.component.html',
  styleUrl: './sales-options.component.scss'
})
export class SalesOptionsComponent {
  private localeRouteService = inject(LocaleRouteService);
  private appStore = inject(AppStore);

  isAdmin(): boolean {
    const user = this.appStore.user();
    return user?.role === UserType.ADMIN;
  }

  navigateToSalesPlan(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesPlan']);
  }

  navigateToSalesReport(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesReport']);
  }
}
