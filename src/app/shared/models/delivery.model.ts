import { DeliveryOrder } from "./deliveryOrder.model";
import { Location } from "./location.model";

export interface Delivery {
  id: string | number;
  address: string;
  location?: Location;
  deliveryDate: string;
  order: DeliveryOrder;
}
