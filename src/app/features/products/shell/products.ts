import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-products',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);

  navigateToAddProduct(): void {
    // Get current language
    const currentLang = this.translocoService.getActiveLang();
    
    // Use relative navigation based on current language
    const addPath = currentLang === 'es' ? 'anadir' : 'add';
    
    // Navigate relative to current route
    this.router.navigate([addPath], { relativeTo: this.route });
  }
}
