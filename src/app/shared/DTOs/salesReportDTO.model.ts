export interface SalesReportDTO {
  ventas_totales: number;
  total_productos_vendidos: number;
  ventas_por_mes: Record<string, number | string>;
  ventas_por_cliente: Record<string, number | string>;
  productos_mas_vendidos: Record<string, number | string>;
}