import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { CategoryDTO } from '../../../shared/DTOs/categoryDTO.model';
import { ProviderDTO } from '../../../shared/DTOs/providerDTO.model';
import { Category } from '../../../shared/models/category.model';
import { Provider } from '../../../shared/models/provider.model';
import { Product } from '../../../shared/models/product.model';
import { AddProductDTO } from '../../../shared/DTOs/addProductDTO.model';
import { ProductDTO } from '../../../shared/DTOs/productDTO.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiClient = inject(ApiClientService);

  getProviders(): Observable<Provider[]> {
    return this.apiClient.get<ProviderDTO[]>('/proveedores', 'users')
      .pipe(
        map(providers => providers.map(p => ({
          id: p.id,
          name: p.nombre,
          email: p.email,
          address: p.direccion
        })))
      );
  }

  getCategories(): Observable<Category[]> {
    return this.apiClient.get<CategoryDTO[]>('/productos/categorias', 'products')
      .pipe(
        map(categories => categories.map(c => ({
          id: c.id,
          name: c.nombre,
          description: c.descripcion
        })))
      );
  }

  addProduct(product: Product): Observable<Product> {
    const addProductDTO: AddProductDTO = {
      nombre: product.name,
      descripcion: product.description,
      precio: product.price,
      stock: product.stock,
      fecha_vencimiento: product.expirationDate.toISOString(),
      categoria: product.category.name,
      categoria_id: product.category.id.toString(),
      proveedor_id: product.provider.id.toString(),
    }

    return this.apiClient.post<ProductDTO>('/productos/con-inventario', addProductDTO, 'products')
      .pipe(
        map(product => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            stock: product.stock,
            expirationDate: new Date(product.fecha_vencimiento),
            category: {
              id: product.categoria.id,
              name: product.categoria.nombre,
              description: product.categoria.descripcion
            },
            provider: {
              id: product.proveedor.id,
              name: product.proveedor.nombre,
              email: product.proveedor.email,
              address: product.proveedor.direccion
            }
          }))
      );
  }
}
