import { DeliveryDTO } from "./deliveryDTO.model";
import { WarehouseDTO } from "./warehouseDTO.model";

export interface RouteDTO {
  id: string | number;
  fecha_ruta: string;
  repartidor_id: string | number;
  entregas: DeliveryDTO[];
  bodega: WarehouseDTO;
}