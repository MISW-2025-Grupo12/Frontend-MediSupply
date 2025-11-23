import { Location } from './location.model';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}