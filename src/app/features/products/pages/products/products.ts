import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';
import { ProductsState } from '../../state/products.store';
import { ProductListComponent } from '../../ui/product-list.component/product-list.component';

@Component({
  selector: 'app-products',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, ProductListComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);
  
  productsStore = inject(ProductsState);

  ngOnInit(): void {
    this.productsStore.loadProducts();
  }

  navigateToAddProduct(): void {
    const currentLang = this.translocoService.getActiveLang();
    const addPath = currentLang === 'es' ? 'anadir' : 'add';
    this.router.navigate([addPath], { relativeTo: this.route });
  }
}
