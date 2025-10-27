import { Component, inject } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sales-plan',
  imports: [TranslocoDirective, MatButtonModule, MatIconModule],
  templateUrl: './sales-plan.html',
  styleUrl: './sales-plan.scss'
})
export class SalesPlanComponent {
  private translocoService = inject(TranslocoService);
  private localeRouteService = inject(LocaleRouteService);

  navigateToAddSalesPlan(): void {
    this.localeRouteService.navigateToNestedRoute(['sales', 'addSalesPlan']);
  }
}
