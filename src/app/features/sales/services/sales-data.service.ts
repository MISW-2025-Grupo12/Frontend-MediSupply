import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SalesReportDTO } from '../../../shared/DTOs/salesReportDTO.model';
import { SalesReport } from '../../../shared/models/salesReport.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppUser } from '../../../shared/models/user.model';
import { AppUserDTO } from '../../../shared/DTOs/appUserDTO.model';
import { UserResponseDTO } from '../../../shared/DTOs/userReponseDTO.model';
import { UserType } from '../../../shared/enums/user-type';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { CreateSalesPlanDTO } from '../../../shared/DTOs/createSalesPlanDTO.model';
import { CreateSalesPlanModel } from '../../../shared/models/createSalesPlan.model';
import { SalesPlan } from '../../../shared/models/salesPlan.model';
import { SalesPlanDTO } from '../../../shared/DTOs/salesPlanDTO.model';
import { ReportCustomerVisit } from '../../../shared/models/reportCustomerVisit.model';
import { ReportCustomerVisitDTO } from '../../../shared/DTOs/reportCustomerVisitDTO.model';
import { PaginationRequestDTO } from '../../../shared/DTOs/paginationRequestDTO.model';
import { Pagination } from '../../../shared/types/pagination';
import { SellerReport } from '../../../shared/models/sellerReport.model';
import { SellerReportDTO } from '../../../shared/DTOs/sellerReportDTO.model';

@Injectable({
  providedIn: 'root'
})
export class SalesDataService {
  private apiClient = inject(ApiClientService);
  private readonly emptyPagination: Pagination = {
    has_next: false,
    has_prev: false,
    page: 1,
    page_size: 0,
    total_items: 0,
    total_pages: 0
  };

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

  getReportCustomerVisits(filters?: PaginationRequestDTO, startDate?: Date, endDate?: Date): Observable<PaginatedResponseDTO<ReportCustomerVisit>> {
    const paramsObj: { [key: string]: string } = {};
    
    if (filters) {
      paramsObj['page'] = filters.page.toString();
      paramsObj['page_size'] = filters.page_size.toString();
    }

    if (startDate) {
      paramsObj['fecha_inicio'] = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    if (endDate) {
      paramsObj['fecha_fin'] = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    const params = Object.keys(paramsObj).length > 0
      ? this.apiClient.buildParams(paramsObj)
      : undefined;

    const options = params ? { params } : undefined;

    return this.apiClient
      .get<PaginatedResponseDTO<ReportCustomerVisitDTO>>('/visitas', 'sales', options)
      .pipe(
        map(response => {
          const items = (response?.items ?? []).map(visit => this.mapReportCustomerVisitDtoToModel(visit));
          const pagination = response?.pagination ?? { ...this.emptyPagination };
          return { items, pagination };
        })
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

  getSellersReport(): Observable<PaginatedResponseDTO<SellerReport>> {
    return this.apiClient.get<PaginatedResponseDTO<SellerReportDTO>>('/informes/vendedores', 'sales')
      .pipe(
        map(response => {
          const items = (response?.items ?? []).map(seller => this.mapSellerReportDtoToModel(seller));
          const pagination = response?.pagination ?? { ...this.emptyPagination };
          return { items, pagination };
        })
      );
  }

  private mapReportCustomerVisitDtoToModel(visit: ReportCustomerVisitDTO): ReportCustomerVisit {
    return {
      id: visit.id,
      visitDate: new Date(visit.fecha_programada),
      address: visit.direccion,
      phone: visit.telefono,
      status: visit.estado,
      description: visit.descripcion,
      seller: visit.vendedor ? this.mapAppUserDtoToPartialModel(visit.vendedor) : {},
      customer: visit.cliente ? this.mapAppUserDtoToPartialModel(visit.cliente) : {}
    };
  }

  private mapAppUserDtoToPartialModel(user: Partial<AppUserDTO>): Partial<AppUser> {
    return {
      id: user.id?.toString(),
      name: user.nombre,
      email: user.email,
      legalId: user.identificacion,
      phone: user.telefono,
      address: user.direccion,
      role: user.tipo_usuario as UserType
    };
  }

  private mapSellerReportDtoToModel(seller: SellerReportDTO): SellerReport {
    return {
      sellerId: seller.vendedor_id,
      sellerName: seller.vendedor_nombre,
      totalOrders: seller.numero_pedidos ?? 0,
      totalSales: seller.total_ventas ?? 0,
      totalCustomers: seller.clientes_atendidos ?? 0
    };
  }
}
