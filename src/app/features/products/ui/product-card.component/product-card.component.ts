import { Component, input, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  product = input.required<Product>();
  translocoService = inject(TranslocoService);

  isNearExpiry(expirationDate: Date): boolean {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }

}
