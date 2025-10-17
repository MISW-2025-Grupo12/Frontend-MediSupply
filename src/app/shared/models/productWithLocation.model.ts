import { Product } from "./product.model";
import { StorageLocation } from "./storageLocation.model";

export interface ProductWithLocation extends Product {
  requiresColdChain: boolean;
  locations: StorageLocation[];
}  