export interface CustomerVisitDTO {
  id_cliente: string | number;
  visitas: DetailedCustomerVisitDTO[];
}

export interface DetailedCustomerVisitDTO {
  id: string | number;
  fecha_programada: string;
  direccion: string;
  telefono: string;
  estado: string;
}