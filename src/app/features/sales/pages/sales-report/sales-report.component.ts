import { Component, inject } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-sales-report.component',
  imports: [TranslocoDirective],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent {
  private translocoService = inject(TranslocoService);
}
