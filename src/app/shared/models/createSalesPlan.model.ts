export interface CreateSalesPlanModel {
  name: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  visits: CreateVisitClient[];
}

export interface CreateVisitClient {
  customerId: string;
  visits: string[];
}