import { ProductOrder } from "./productOrder.model";

export interface Order {
  id: string | number;
  sellerId: string | number;
  customerId: string | number;
  status: string;
  total: number;
  creationDate: string;
  items: ProductOrder[];
}