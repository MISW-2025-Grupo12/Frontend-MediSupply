import { CustomerVisitDTO } from "./customerVisitDTO.model";

export interface SalesPlanDTO {
  id: string | number;
  nombre: string;
  id_usuario: string | number;
  fecha_inicio: string;
  fecha_fin: string;
  visitas_clientes: CustomerVisitDTO[];
}