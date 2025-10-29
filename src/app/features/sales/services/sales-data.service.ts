import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SalesReportDTO } from '../../../shared/DTOs/salesReportDTO.model';
import { SalesReport } from '../../../shared/models/salesReport.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppUser } from '../../../shared/models/user.model';
import { UserResponseDTO } from '../../../shared/DTOs/userReponseDTO.model';
import { UserType } from '../../../shared/enums/user-type';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';


@Injectable({
  providedIn: 'root'
})
export class SalesDataService {
  private apiClient = inject(ApiClientService);

  getSalesReportData(startDate?: Date, endDate?: Date): Observable<SalesReport> {
    // Build query parameters for date filtering
    const params: { [key: string]: string } = {};

    if (startDate) {
      params['fecha_inicio'] = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    if (endDate) {
      params['fecha_fin'] = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    // Pass params in the options object
    const options = params && Object.keys(params).length > 0 ? { params } : undefined;

    return this.apiClient.get<SalesReportDTO>('/informes/ventas', 'sales', options)
      .pipe(
        map(salesReport => ({
          totalSales: salesReport.ventas_totales || 0,
          totalProductsSold: salesReport.total_productos_vendidos || 0,
          salesByMonth: salesReport.ventas_por_mes || {},
          salesByCustomer: Array.isArray(salesReport.ventas_por_cliente)
            ? salesReport.ventas_por_cliente.map(customer => ({
              customerId: customer.cliente_id,
              name: customer.nombre,
              totalOrders: customer.cantidad_pedidos,
              totalAmount: customer.monto_total
            }))
            : [],
          mostSoldProducts: Array.isArray(salesReport.productos_mas_vendidos)
            ? salesReport.productos_mas_vendidos.map(product => ({
              productId: product.producto_id,
              name: product.nombre,
              quantity: product.cantidad
            }))
            : []
        }))
      );
  }

  getCustomers(): Observable<AppUser[]> {
    return this.apiClient.get<PaginatedResponseDTO<UserResponseDTO>>('/clientes', 'users')
      .pipe(
        map(response => response.items.map(customer => ({
          id: customer.id,
          name: customer.nombre,
          legalId: customer.identificacion,
          phone: customer.telefono,
          address: customer.direccion,
          email: customer.email,
          role: UserType.CUSTOMER
        })))
      );
  }
}
