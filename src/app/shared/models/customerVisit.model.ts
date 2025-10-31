export interface CustomerVisit {
  id: string | number;
  visits: DetailedCustomerVisit[];
}

export interface DetailedCustomerVisit {
  id: string | number;
  visitDate: Date;
  address: string;
  phone: string;
  status?: string;
}
