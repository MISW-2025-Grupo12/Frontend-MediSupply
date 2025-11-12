import { DeliveryCustomer } from "./deliveryCustomer.model";
import { DeliveryProduct } from "./deliveryProduct.model";

export interface DeliveryOrder {
  id: string | number;
  total: number;
  status: string;
  confirmationDate: string;
  sellerId: string | number;
  customer: DeliveryCustomer;
  products: DeliveryProduct[];
}