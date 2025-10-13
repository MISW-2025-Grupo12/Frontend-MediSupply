import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-sales.component',
  imports: [TranslocoDirective, MatIconModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);

  navigateToSalesReport(): void {
    this.router.navigate(['sales-report'], { relativeTo: this.route });
  }
}
