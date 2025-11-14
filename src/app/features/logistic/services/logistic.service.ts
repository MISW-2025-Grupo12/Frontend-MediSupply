import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DeliveryDTO } from '../../../shared/DTOs/deliveryDTO.model';
import { DeliveryRequestParamsDTO } from '../../../shared/DTOs/deliveryRequestParamsDTO.model';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { ApiClientService, ServiceType } from '../../../core/services/api-client.service';
import { Delivery } from '../../../shared/models/delivery.model';
import { DeliveryOrder } from '../../../shared/models/deliveryOrder.model';
import { DeliveryCustomer } from '../../../shared/models/deliveryCustomer.model';
import { DeliveryProduct } from '../../../shared/models/deliveryProduct.model';
import { DeliveryOrderDTO } from '../../../shared/DTOs/deliveryOrderDTO.model';
import { DeliveryCustomerDTO } from '../../../shared/DTOs/deliveryCustomerDTO.model';
import { DeliveryProductDTO } from '../../../shared/DTOs/deliveryProductDTO.model';
import { WarehouseDTO } from '../../../shared/DTOs/warehouseDTO.model';
import { Warehouse } from '../../../shared/models/warehouse.model';
import { Pagination } from '../../../shared/types/pagination';
import { CreateRoute } from '../../../shared/models/createRoute.model';
import { CreateRouteDTO } from '../../../shared/DTOs/createRouteDTO.model';
import { RouteDTO } from '../../../shared/DTOs/routeDTO.model';
import { Route } from '../../../shared/models/route.model';

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

  getDeliveries(filters?: Partial<DeliveryRequestParamsDTO>): Observable<PaginatedResponseDTO<Delivery>> {
    const params = filters
      ? this.apiClient.buildParams({
          page: filters.page,
          page_size: filters.page_size,
          fecha_inicio: filters.fecha_inicio,
          fecha_fin: filters.fecha_fin,
          estado_pedido: filters.estado_pedido,
          cliente_id: filters.cliente_id,
          con_ruta: filters.con_ruta
        })
      : undefined;

    const options = params ? { params } : undefined;

    return this.apiClient
      .get<PaginatedResponseDTO<DeliveryDTO>>('/entregas', this.serviceType, options)
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

  getRoutes(): Observable<Route[]> {
    return this.apiClient.get<RouteDTO[]>('/rutas', this.serviceType).pipe(
      map(response => (response ?? []).map(route => this.mapRouteDtoToModel(route)))
    );
  }

  createRoute(route: CreateRoute): Observable<Route> {
    const payload = this.mapCreateRouteModelToDto(route);
    return this.apiClient.post<RouteDTO>('/rutas', payload, this.serviceType).pipe(
      map(response => this.mapRouteDtoToModel(response))
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

  private mapRouteDtoToModel(route: RouteDTO): Route {
    return {
      id: route.id,
      date: route.fecha_ruta,
      driverId: route.repartidor_id,
      deliveries: (route.entregas ?? []).map(delivery => this.mapDeliveryDtoToModel(delivery)),
      warehouse: this.mapWarehouseDtoToModel(route.bodega)
    };
  }

  private mapCreateRouteModelToDto(route: CreateRoute): CreateRouteDTO {
    return {
      fecha_ruta: route.date,
      repartidor_id: route.driverId,
      entregas: route.deliveries.map(delivery => delivery.id),
      bodega_id: route.warehouse.id
    };
  }
}
