import { Delivery } from "../models/delivery.model";
import { Location } from "../models/location.model";

export type DeliveryRouteNode = {
  delivery: Delivery;
  location: Location;
};