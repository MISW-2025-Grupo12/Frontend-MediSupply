import { Category } from "./category.model";
import { Provider } from "./provider.model";

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  expirationDate: Date;
  category: Category;
  provider: Provider;
}