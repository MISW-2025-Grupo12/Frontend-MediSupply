export interface SalesReport {
  totalSales: number;
  totalProductsSold: number;
  salesByMonth: Record<string, number | string>;
  salesByCustomer: SalesPerCustomer[];
  mostSoldProducts: SalesPerProduct[];
}

export interface SalesPerCustomer {
  customerId: string | number;
  name: string;
  totalOrders: number;
  totalAmount: number;
}

export interface SalesPerProduct {
  productId: string | number;
  name: string;
  quantity: number;
}
