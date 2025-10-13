import { Injectable } from '@angular/core';

export interface SalesData {
  id: string;
  date: Date;
  company: string;
  seller: string;
  customer: string;
  product: string;
  amount: number;
  quantity: number;
}

export interface SalesSummary {
  totalSalesByCompany: number;
  totalSalesBySeller: number;
  totalSales: number;
  totalTransactions: number;
}

export interface DashboardSummary {
  totalSales: number; // All sales
  currentSellerSales: number; // Current seller's sales amount only
  sellerName: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
  colors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesDataService {

  private mockData: SalesData[] = [
    // Company A - Seller John
    { id: '1', date: new Date('2024-01-15'), company: 'MediCorp A', seller: 'John Smith', customer: 'Hospital Central', product: 'Surgical Masks', amount: 15000, quantity: 500 },
    { id: '2', date: new Date('2024-01-20'), company: 'MediCorp A', seller: 'John Smith', customer: 'Clinic Norte', product: 'Antibiotics', amount: 25000, quantity: 100 },
    { id: '3', date: new Date('2024-02-05'), company: 'MediCorp A', seller: 'John Smith', customer: 'Hospital Sur', product: 'Syringes', amount: 8000, quantity: 200 },
    
    // Company A - Seller Maria
    { id: '4', date: new Date('2024-01-25'), company: 'MediCorp A', seller: 'Maria Garcia', customer: 'Farmacia Popular', product: 'Pain Relievers', amount: 12000, quantity: 80 },
    { id: '5', date: new Date('2024-02-10'), company: 'MediCorp A', seller: 'Maria Garcia', customer: 'Hospital Central', product: 'Thermometers', amount: 18000, quantity: 60 },
    
    // Company B - Seller Carlos
    { id: '6', date: new Date('2024-01-30'), company: 'HealthSupply B', seller: 'Carlos Rodriguez', customer: 'Clinic Este', product: 'Blood Pressure Monitors', amount: 35000, quantity: 25 },
    { id: '7', date: new Date('2024-02-15'), company: 'HealthSupply B', seller: 'Carlos Rodriguez', customer: 'Hospital Norte', product: 'Surgical Gloves', amount: 22000, quantity: 300 },
    
    // Company B - Seller Ana
    { id: '8', date: new Date('2024-02-08'), company: 'HealthSupply B', seller: 'Ana Martinez', customer: 'Farmacia Central', product: 'Vitamins', amount: 16000, quantity: 120 },
    { id: '9', date: new Date('2024-02-20'), company: 'HealthSupply B', seller: 'Ana Martinez', customer: 'Clinic Oeste', product: 'Bandages', amount: 9000, quantity: 150 },
    
    // Company C - Seller Luis
    { id: '10', date: new Date('2024-01-18'), company: 'PharmaDistrib C', seller: 'Luis Hernandez', customer: 'Hospital Pediatrico', product: 'Pediatric Medicines', amount: 28000, quantity: 75 },
    { id: '11', date: new Date('2024-02-12'), company: 'PharmaDistrib C', seller: 'Luis Hernandez', customer: 'Clinic Sur', product: 'Dental Supplies', amount: 14000, quantity: 90 },
    
    // More recent data
    { id: '12', date: new Date('2024-03-01'), company: 'MediCorp A', seller: 'John Smith', customer: 'Hospital Central', product: 'Oxygen Masks', amount: 20000, quantity: 100 },
    { id: '13', date: new Date('2024-03-05'), company: 'HealthSupply B', seller: 'Carlos Rodriguez', customer: 'Emergency Clinic', product: 'Defibrillator', amount: 85000, quantity: 5 },
    { id: '14', date: new Date('2024-03-10'), company: 'PharmaDistrib C', seller: 'Luis Hernandez', customer: 'Rehabilitation Center', product: 'Physical Therapy Equipment', amount: 45000, quantity: 15 },
  ];

  getSalesData(startDate?: Date, endDate?: Date): SalesData[] {
    let filteredData = [...this.mockData];
    
    if (startDate) {
      filteredData = filteredData.filter(sale => sale.date >= startDate);
    }
    
    if (endDate) {
      filteredData = filteredData.filter(sale => sale.date <= endDate);
    }
    
    return filteredData;
  }

  getSalesSummary(startDate?: Date, endDate?: Date): SalesSummary {
    const data = this.getSalesData(startDate, endDate);
    
    const totalSales = data.reduce((sum, sale) => sum + sale.amount, 0);
    const totalTransactions = data.length;
    
    // Group by company
    const companySales = data.reduce((acc, sale) => {
      acc[sale.company] = (acc[sale.company] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by seller
    const sellerSales = data.reduce((acc, sale) => {
      acc[sale.seller] = (acc[sale.seller] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const totalSalesByCompany = Object.keys(companySales).length;
    const totalSalesBySeller = Object.keys(sellerSales).length;
    
    return {
      totalSalesByCompany,
      totalSalesBySeller,
      totalSales,
      totalTransactions
    };
  }

  getDashboardSummary(startDate?: Date, endDate?: Date): DashboardSummary {
    // Mock current seller - in a real app this would come from auth service
    const currentSeller = 'John Smith';
    
    const data = this.getSalesData(startDate, endDate);
    
    // Total sales for everyone
    const totalSales = data.reduce((sum, sale) => sum + sale.amount, 0);
    
    // Current seller's sales amount only
    const sellerData = data.filter(sale => sale.seller === currentSeller);
    const currentSellerSales = sellerData.reduce((sum, sale) => sum + sale.amount, 0);
    
    return {
      totalSales,
      currentSellerSales,
      sellerName: currentSeller
    };
  }

  getChartDataByCompany(startDate?: Date, endDate?: Date): ChartData {
    const data = this.getSalesData(startDate, endDate);
    
    const companySales = data.reduce((acc, sale) => {
      acc[sale.company] = (acc[sale.company] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: Object.keys(companySales),
      data: Object.values(companySales),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    };
  }

  getChartDataByCustomer(startDate?: Date, endDate?: Date): ChartData {
    const data = this.getSalesData(startDate, endDate);
    
    const customerSales = data.reduce((acc, sale) => {
      acc[sale.customer] = (acc[sale.customer] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by amount and take top 8
    const sortedCustomers = Object.entries(customerSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    
    return {
      labels: sortedCustomers.map(([customer]) => customer),
      data: sortedCustomers.map(([, amount]) => amount),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']
    };
  }

  getChartDataByProduct(startDate?: Date, endDate?: Date): ChartData {
    const data = this.getSalesData(startDate, endDate);
    
    const productSales = data.reduce((acc, sale) => {
      acc[sale.product] = (acc[sale.product] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by amount and take top 10
    const sortedProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    return {
      labels: sortedProducts.map(([product]) => product),
      data: sortedProducts.map(([, amount]) => amount),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#F472B6', '#A78BFA']
    };
  }
}
