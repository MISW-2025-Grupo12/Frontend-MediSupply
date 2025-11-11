export interface CreateRouteDTO {
  fecha_ruta: string;
  repartidor_id: string | number;
  entregas: (string | number)[];
}