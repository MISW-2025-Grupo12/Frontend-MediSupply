import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

@Component({
  selector: 'app-sales-options',
  imports: [TranslocoDirective, MatIconModule],
  templateUrl: './sales-options.component.html',
  styleUrl: './sales-options.component.scss'
})
export class SalesOptionsComponent {
  private localeRouteService = inject(LocaleRouteService);

  navigateToSalesReport(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'salesReport']);
  }
}
