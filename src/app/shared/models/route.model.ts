import { Delivery } from "./delivery.model";
import { Warehouse } from "./warehouse.model";

export interface Route {
  id: string | number;
  date: string;
  driverId: string | number;
  deliveries: Delivery[];
  warehouse: Warehouse;
}