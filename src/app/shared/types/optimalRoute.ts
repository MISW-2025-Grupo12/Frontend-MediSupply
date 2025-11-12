import { DeliveryRouteNode } from "./deliveryRouteNode";

export type OptimalRoute = {
  order: DeliveryRouteNode[];
  totalDistance: number;
};