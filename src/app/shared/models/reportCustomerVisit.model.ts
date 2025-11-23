import { AppUser } from "./user.model";

export interface ReportCustomerVisit {
  id: string | number;
  visitDate: Date;
  address: string;
  phone: string;
  status: string;
  description: string;
  seller: Partial<AppUser>;
  customer: Partial<AppUser>;
}