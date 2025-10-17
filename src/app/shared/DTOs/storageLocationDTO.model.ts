export interface StorageLocationDTO {
  id: string | number;
  nombre: string;
  pasillo: string;
  estante: string;
  stock_disponible: number;
  stock_reservado: number;
}