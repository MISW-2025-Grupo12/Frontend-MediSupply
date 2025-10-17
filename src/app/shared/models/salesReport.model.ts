export interface SalesReport {
  totalSales: number;
  totalProductsSold: number;
  salesByMonth: Record<string, number | string>;
  salesByCustomer: Record<string, number | string>;
  mostSoldProducts: Record<string, number | string>;
}