import { Component } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { SalesOptionsComponent } from '../../ui/sales-options/sales-options.component';
import { DashboardComponent } from '../../ui/dashboard/dashboard.component';

@Component({
  selector: 'app-sales.component',
  imports: [TranslocoDirective, SalesOptionsComponent, DashboardComponent],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
}
