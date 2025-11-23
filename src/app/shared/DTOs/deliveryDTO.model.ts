import { DeliveryOrderDTO } from "./deliveryOrderDTO.model";

export interface DeliveryDTO {
  id: string | number;
  direccion: string;
  fecha_entrega: string;
  pedido: DeliveryOrderDTO;
}