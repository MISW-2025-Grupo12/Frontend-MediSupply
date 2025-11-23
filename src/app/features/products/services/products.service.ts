import { inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ApiClientService, ServiceType } from '../../../core/services/api-client.service';
import { CategoryDTO } from '../../../shared/DTOs/categoryDTO.model';
import { ProviderDTO } from '../../../shared/DTOs/providerDTO.model';
import { Category } from '../../../shared/models/category.model';
import { Provider } from '../../../shared/models/provider.model';
import { Product } from '../../../shared/models/product.model';
import { AddProductDTO } from '../../../shared/DTOs/addProductDTO.model';
import { ProductDTO } from '../../../shared/DTOs/productDTO.model';
import { ProductWithLocationDTO } from '../../../shared/DTOs/productWithLocationDTO.model';
import { ProductWithLocation } from '../../../shared/models/productWithLocation.model';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { LoadFileJobDTO } from '../../../shared/DTOs/loadFileJobDTO.model';
import { LoadFileJob } from '../../../shared/models/loadFileJob.model';
import { LoadFileStatus } from '../../../shared/models/loadFileStatus.model';
import { LoadFileStatusDTO } from '../../../shared/DTOs/loadFileStatusDTO.model';
import { PaginationRequestDTO } from '../../../shared/DTOs/paginationRequestDTO.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiClient = inject(ApiClientService);
  private serviceType: ServiceType = 'products';

  getProviders(): Observable<Provider[]> {
      return this.apiClient.get<PaginatedResponseDTO<ProviderDTO>>('/proveedores', 'users')
      .pipe(
        map(response => response.items.map(p => ({
          id: p.id,
          name: p.nombre,
          email: p.email,
          address: p.direccion
        })))
      );
  }

  getCategories(): Observable<Category[]> {
    return this.apiClient.get<PaginatedResponseDTO<CategoryDTO>>('/categorias/', this.serviceType)
      .pipe(
        map(response => response.items.map(c => ({
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

    return this.apiClient.post<ProductDTO>('/productos/con-inventario', addProductDTO, this.serviceType)
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

  addProductsFromFile(file: File): Observable<LoadFileJob> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiClient.post<LoadFileJobDTO>('/productos/carga-masiva', formData, this.serviceType).pipe(
      map(response => ({
        jobId: response.job_id,
        status: response.status,
        totalLines: response.total_filas
      }))
    );
  }

  getLoadFileStatus(jobId: string): Observable<LoadFileStatus> {
    return this.apiClient.get<LoadFileStatusDTO>('/productos/carga-masiva/' + jobId, this.serviceType).pipe(
      map(response => ({
        jobId: response.job_id,
        status: response.status,
        progress: {
          totalLines: response.progreso.total_filas,
          processedLines: response.progreso.filas_procesadas,
          successfulLines: response.progreso.filas_exitosas,
          errorLines: response.progreso.filas_error,
          rejectedLines: response.progreso.filas_rechazadas,
          percentage: response.progreso.porcentaje
        },
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        resultUrl: response.result_url
      })))
  }

  getProductsWithLocation(pagination: PaginationRequestDTO): Observable<PaginatedResponseDTO<ProductWithLocation>> {
    const params = this.apiClient.buildParams(pagination);

    return this.apiClient.get<PaginatedResponseDTO<ProductWithLocationDTO>>('/bodegas/productos', 'logistics', { params })
      .pipe(
        map(response => ({
          items: response.items.map(p => ({
            id: p.id,
            name: p.nombre,
            description: p.descripcion,
            price: p.precio,
            stock: p.stock,
            expirationDate: new Date(p.fecha_vencimiento),
            category: {
              id: p.categoria.id,
              name: p.categoria.nombre,
              description: p.categoria.descripcion
            },
            provider: {
              id: p.proveedor.id,
              name: p.proveedor.nombre,
              email: p.proveedor.email,
              address: p.proveedor.direccion
            },
            requiresColdChain: p.requiere_cadena_frio,
            locations: p.ubicaciones.map(l => ({
              id: l.id,
              name: l.nombre,
              aisle: l.pasillo,
              rack: l.estante,
              available_quantity: l.stock_disponible,
              reserved_quantity: l.stock_reservado
            }))
          })),
          pagination: response.pagination
        }))
      );
  }

  createProductCategory(category: Partial<Category>): Observable<Category> {
    const dto = {
      nombre: category.name,
      descripcion: category.description
    }

    return this.apiClient.post<CategoryDTO>('/categorias/', dto, this.serviceType).pipe(
      map(response => ({
        id: response.id,
        name: response.nombre,
        description: response.descripcion
      }))
    );
  }
}
