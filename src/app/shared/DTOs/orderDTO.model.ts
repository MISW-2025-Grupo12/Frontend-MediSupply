import { ProductOrderDTO } from "./productOrderDTO.model";

export interface OrderDTO {
  id: string | number;
  vendedor_id: string | number;
  cliente_id: string | number;
  estado: string;
  total: number;
  fecha_creacion: string;
  items: ProductOrderDTO[];
}