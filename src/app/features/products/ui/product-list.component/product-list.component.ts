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
  selectedCategory = signal<string>('');
  selectedWarehouse = signal<string>('');

  categories = computed(() => {
    const categoriesSet = new Set<string>();

    this.products().forEach(product => {
      const categoryName = product.category?.name?.trim();
      if (categoryName) {
        categoriesSet.add(categoryName);
      }
    });

    return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
  });

  warehouses = computed(() => {
    const warehousesSet = new Set<string>();

    this.products().forEach(product => {
      product.locations?.forEach(location => {
        if (location.available_quantity > 0) {
          const warehouseName = location.name?.trim();
          if (warehouseName) {
            warehousesSet.add(warehouseName);
          }
        }
      });
    });

    return Array.from(warehousesSet).sort((a, b) => a.localeCompare(b));
  });
  
  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const selectedCategory = this.selectedCategory();
    const selectedWarehouse = this.selectedWarehouse();
    const productsList = this.products();
    
    return productsList.filter(product => {
      const matchesName = !search || product.name.toLowerCase().includes(search);
      const matchesCategory = !selectedCategory || product.category?.name === selectedCategory;
      const matchesWarehouse =
        !selectedWarehouse ||
        product.locations?.some(
          location =>
            location.available_quantity > 0 &&
            location.name?.trim() === selectedWarehouse
        );

      return matchesName && matchesCategory && matchesWarehouse;
    });
  });
  
  onSearchChange(searchValue: string): void {
    this.searchTerm.set(searchValue);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  onWarehouseChange(warehouse: string): void {
    this.selectedWarehouse.set(warehouse);
  }
}
