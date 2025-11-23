import { DeliveryCustomerDTO } from "./deliveryCustomerDTO.model";
import { DeliveryProductDTO } from "./deliveryProductDTO.model";

export interface DeliveryOrderDTO {
  id: string | number;
  total: number;
  estado: string;
  fecha_confirmacion: string;
  vendedor_id: string | number;
  cliente: DeliveryCustomerDTO;
  productos: DeliveryProductDTO[];
}