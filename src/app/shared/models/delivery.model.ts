import { DeliveryOrder } from "./deliveryOrder.model";

export interface Delivery {
  id: string | number;
  direccion: string;
  fecha_entrega: string;
  pedido: DeliveryOrder;
}
