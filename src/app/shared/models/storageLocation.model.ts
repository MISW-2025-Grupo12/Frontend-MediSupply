export interface StorageLocation {
  id: string | number;
  name: string;
  aisle: string;
  rack: string;
  available_quantity: number;
  reserved_quantity: number;
}