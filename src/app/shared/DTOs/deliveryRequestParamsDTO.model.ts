import { PaginationRequestDTO } from "./paginationRequestDTO.model";

export interface DeliveryRequestParamsDTO extends PaginationRequestDTO {
  fecha_inicio: string;
  fecha_fin: string;
  estado_pedido: string;
  cliente_id: string;
  con_ruta: boolean;
}