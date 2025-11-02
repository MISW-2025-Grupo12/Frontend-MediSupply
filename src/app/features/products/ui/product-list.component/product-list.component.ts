import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { ProductWithLocation } from '../../../../shared/models/productWithLocation.model';
import { ProductCardComponent } from '../product-card.component/product-card.component';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, MatIconModule, ProductCardComponent, TranslocoDirective],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  products = input.required<ProductWithLocation[]>();
  
  searchTerm = signal<string>('');
  
  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const productsList = this.products();
    
    if (!search) {
      return productsList;
    }
    
    return productsList.filter(product => 
      product.name.toLowerCase().includes(search)
    );
  });
  
  onSearchChange(searchValue: string): void {
    this.searchTerm.set(searchValue);
  }
}
