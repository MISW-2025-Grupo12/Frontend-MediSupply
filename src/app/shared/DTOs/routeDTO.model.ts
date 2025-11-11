import { DeliveryDTO } from "./deliveryDTO.model";

export interface RouteDTO {
  id: string | number;
  fecha_ruta: string;
  repartidor_id: string | number;
  entregas: DeliveryDTO[];
}