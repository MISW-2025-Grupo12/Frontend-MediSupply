import { DeliveryCustomer } from "./deliveryCustomer.model";
import { DeliveryProduct } from "./deliveryProduct.model";

export interface DeliveryOrder {
  id: string | number;
  total: number;
  estado: string;
  fecha_confirmacion: string;
  vendedor_id: string | number;
  cliente: DeliveryCustomer;
  productos: DeliveryProduct[];
}