export interface CreateSalesPlanDTO {
  nombre: string;
  id_usuario: string;
  fecha_inicio: string;
  fecha_fin: string;
  visitas_clientes: CreateVisitClientDTO[];
}

export interface CreateVisitClientDTO {
  id_cliente: string;
  visitas: string[];
}