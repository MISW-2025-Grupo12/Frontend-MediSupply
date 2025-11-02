import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SalesReportDTO } from '../../../shared/DTOs/salesReportDTO.model';
import { SalesReport } from '../../../shared/models/salesReport.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppUser } from '../../../shared/models/user.model';
import { UserResponseDTO } from '../../../shared/DTOs/userReponseDTO.model';
import { UserType } from '../../../shared/enums/user-type';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { CreateSalesPlanDTO } from '../../../shared/DTOs/createSalesPlanDTO.model';
import { CreateSalesPlanModel } from '../../../shared/models/createSalesPlan.model';
import { SalesPlan } from '../../../shared/models/salesPlan.model';
import { SalesPlanDTO } from '../../../shared/DTOs/salesPlanDTO.model';


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

  getSalesPlans(userId?: string): Observable<SalesPlan[]> {
    const params: { [key: string]: string } = {};
    
    if (userId) {
      params['user_id'] = userId;
    }
    
    return this.apiClient.get<PaginatedResponseDTO<SalesPlanDTO>>('/planes', 'sales', { params })
      .pipe(
        map(response => response.items.map(salesPlan => ({
          id: salesPlan.id,
          name: salesPlan.nombre,
          userId: salesPlan.id_usuario,
          startDate: new Date(salesPlan.fecha_inicio),
          endDate: new Date(salesPlan.fecha_fin),
          customerVisits: salesPlan.visitas_clientes.map(visit => ({
            id: visit.id_cliente,
            visits: visit.visitas.map(visit => ({
              id: visit.id?.toString() || '',
              visitDate: new Date(visit.fecha_programada),
              address: visit.direccion,
              phone: visit.telefono,
              status: visit.estado
            }))
          }))
        })))
      );
  }

  createSalesPlan(salesPlan: CreateSalesPlanModel): Observable<boolean> {
    const dto: CreateSalesPlanDTO = {
      nombre: salesPlan.name,
      id_usuario: salesPlan.userId,
      fecha_inicio: salesPlan.startDate.toISOString().split('T')[0],
      fecha_fin: salesPlan.endDate.toISOString().split('T')[0],
      visitas_clientes: salesPlan.visits.map(visit => ({
        id_cliente: visit.customerId,
        visitas: visit.visits
      }))
    }
    
    return this.apiClient.post<{ message: string, plan_id: string, success: boolean }>('/planes', dto, 'sales')
      .pipe(
        map(response => response.success)
      );
  }
}
