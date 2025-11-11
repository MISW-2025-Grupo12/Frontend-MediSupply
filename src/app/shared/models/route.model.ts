import { Delivery } from "./delivery.model";

export interface Route {
  id: string | number;
  date: string;
  driverId: string | number;
  deliveries: Delivery[];
}