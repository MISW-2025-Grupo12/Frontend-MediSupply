import { CategoryDTO } from "./categoryDTO.model";
import { ProviderDTO } from "./providerDTO.model";

export interface ProductDTO {
  id: string | number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  fecha_vencimiento: string;
  categoria: CategoryDTO;
  proveedor: ProviderDTO;
}