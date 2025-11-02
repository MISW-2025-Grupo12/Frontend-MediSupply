import { CustomerVisit } from "./customerVisit.model";

export interface SalesPlan {
  id: string | number;
  name: string;
  userId: string | number;
  startDate: Date;
  endDate: Date;
  customerVisits: CustomerVisit[];
}