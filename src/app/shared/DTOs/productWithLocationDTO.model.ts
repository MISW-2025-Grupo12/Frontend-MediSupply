import { ProductDTO } from "./productDTO.model";
import { StorageLocationDTO } from "./storageLocationDTO.model";

export interface ProductWithLocationDTO extends ProductDTO {
  requiere_cadena_frio: boolean;
  ubicaciones: StorageLocationDTO[];
}