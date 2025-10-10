export interface AddProductDTO {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  fecha_vencimiento: string;
  categoria: string;
  categoria_id: string;
  proveedor_id: string;
}