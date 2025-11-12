import { Delivery } from "./delivery.model";
import { Warehouse } from "./warehouse.model";

export interface CreateRoute {
  date: string;
  driverId: string | number;
  deliveries: Delivery[];
  warehouse: Warehouse;
}
