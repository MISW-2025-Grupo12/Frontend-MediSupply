export interface SalesReportDTO {
  ventas_totales: number;
  total_productos_vendidos: number;
  ventas_por_mes: Record<string, number | string>;
  ventas_por_cliente: SalesPerCustomerDTO[] | Record<string, any>;
  productos_mas_vendidos: SalesPerProductDTO[] | Record<string, any>;
}

export interface SalesPerCustomerDTO {
  cliente_id: string | number;
  nombre: string;
  cantidad_pedidos: number;
  monto_total: number;
}

export interface SalesPerProductDTO {
  producto_id: string | number;
  nombre: string;
  cantidad: number;
}

