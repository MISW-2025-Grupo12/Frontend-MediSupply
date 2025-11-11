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

@Injectable({
  providedIn: 'root'
})
export class LogisticService {
  private apiClient = inject(ApiClientService);
  private serviceType: ServiceType = 'logistics';

  getDeliveries(): Observable<PaginatedResponseDTO<Delivery>> {
    return this.apiClient
      .get<PaginatedResponseDTO<DeliveryDTO>>('/entregas', this.serviceType)
      .pipe(
        map(response => ({
          items: response.items.map(delivery => this.mapDeliveryDtoToModel(delivery)),
          pagination: response.pagination
        }))
      );
  }

  private mapDeliveryDtoToModel(delivery: DeliveryDTO): Delivery {
    return {
      id: delivery.id,
      direccion: delivery.direccion,
      fecha_entrega: delivery.fecha_entrega,
      pedido: this.mapDeliveryOrderDtoToModel(delivery.pedido)
    };
  }

  private mapDeliveryOrderDtoToModel(order: DeliveryOrderDTO): DeliveryOrder {
    return {
      id: order.id,
      total: order.total,
      estado: order.estado,
      fecha_confirmacion: order.fecha_confirmacion,
      vendedor_id: order.vendedor_id,
      cliente: this.mapDeliveryCustomerDtoToModel(order.cliente),
      productos: order.productos.map(product => this.mapDeliveryProductDtoToModel(product))
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
