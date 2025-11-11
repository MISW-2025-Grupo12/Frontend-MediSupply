import { Delivery } from "./delivery.model";

export interface CreateRoute {
  date: string;
  driverId: string | number;
  deliveries: Delivery[];
}
