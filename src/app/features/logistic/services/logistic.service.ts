import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { DeliveryDTO } from '../../../shared/DTOs/deliveryDTO.model';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { ApiClientService, ServiceType } from '../../../core/services/api-client.service';
import { Delivery } from '../../../shared/models/delivery.model';
import { DeliveryOrder } from '../../../shared/models/deliveryOrder.model';
import { DeliveryCustomer } from '../../../shared/models/deliveryCustomer.model';
import { DeliveryProduct } from '../../../shared/models/deliveryProduct.model';
import { DeliveryOrderDTO } from '../../../shared/DTOs/deliveryOrderDTO.model';
import { DeliveryCustomerDTO } from '../../../shared/DTOs/deliveryCustomerDTO.model';
import { DeliveryProductDTO } from '../../../shared/DTOs/deliveryProductDTO.model';
import { MOCK_LOGISTIC_DELIVERIES_RESPONSE } from './logistic.mock';
import { WarehouseDTO } from '../../../shared/DTOs/warehouseDTO.model';
import { Warehouse } from '../../../shared/models/warehouse.model';
import { Pagination } from '../../../shared/types/pagination';

@Injectable({
  providedIn: 'root'
})
export class LogisticService {
  private apiClient = inject(ApiClientService);
  private serviceType: ServiceType = 'logistics';
  private readonly emptyPagination: Pagination = {
    has_next: false,
    has_prev: false,
    page: 1,
    page_size: 0,
    total_items: 0,
    total_pages: 0
  };

  getDeliveries(): Observable<PaginatedResponseDTO<Delivery>> {
    return this.apiClient
      .get<PaginatedResponseDTO<DeliveryDTO>>('/entregas', this.serviceType)
      .pipe(
        map(response => {
          const items = (response?.items ?? []).map(delivery => this.mapDeliveryDtoToModel(delivery));
          const pagination = response?.pagination ?? { ...this.emptyPagination };
          return { items, pagination };
        })
      );
  }

  getWarehouses(): Observable<PaginatedResponseDTO<Warehouse>> {
    return this.apiClient
      .get<PaginatedResponseDTO<WarehouseDTO>>('/bodegas', this.serviceType)
      .pipe(
        map(response => {
          const items = (response?.items ?? []).map(warehouse => this.mapWarehouseDtoToModel(warehouse));
          const pagination = response?.pagination ?? { ...this.emptyPagination };
          return { items, pagination };
        })
      );
  }

  private mapWarehouseDtoToModel(warehouse: WarehouseDTO): Warehouse {
    return {
      id: warehouse.id,
      name: warehouse.nombre,
      address: warehouse.direccion,
      createdAt: warehouse.created_at,
      updatedAt: warehouse.updated_at
    };
  }

  private mapDeliveryDtoToModel(delivery: DeliveryDTO): Delivery {
    return {
      id: delivery.id,
      address: delivery.direccion,
      deliveryDate: delivery.fecha_entrega,
      order: this.mapDeliveryOrderDtoToModel(delivery.pedido)
    };
  }

  private mapDeliveryOrderDtoToModel(order: DeliveryOrderDTO): DeliveryOrder {
    return {
      id: order.id,
      total: order.total,
      status: order.estado,
      confirmationDate: order.fecha_confirmacion,
      sellerId: order.vendedor_id,
      customer: this.mapDeliveryCustomerDtoToModel(order.cliente),
      products: order.productos.map(product => this.mapDeliveryProductDtoToModel(product))
    };
  }

  private mapDeliveryCustomerDtoToModel(customer: DeliveryCustomerDTO): DeliveryCustomer {
    return {
      name: customer.nombre,
      phone: customer.telefono,
      address: customer.direccion,
      avatar: customer.avatar
    };
  }

  private mapDeliveryProductDtoToModel(product: DeliveryProductDTO): DeliveryProduct {
    return {
      productId: product.producto_id,
      name: product.nombre,
      quantity: product.cantidad,
      price: product.precio_unitario,
      subtotal: product.subtotal,
      avatar: product.avatar
    };
  }

  getMockDeliveries(): Observable<PaginatedResponseDTO<Delivery>> {
    return of(MOCK_LOGISTIC_DELIVERIES_RESPONSE).pipe(
      map(response => ({
        items: response.items.map(delivery => this.mapDeliveryDtoToModel(delivery)),
        pagination: response.pagination
      }))
    );
  }
}
