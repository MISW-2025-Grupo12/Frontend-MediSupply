import { Routes } from "@angular/router";
import { Products } from "./products";
import { AddProduct } from "../ui/add-product/add-product";

export const PRODUCTS_ROUTES: Routes = [
  { 
    path: '', 
    component: Products,
    data: { titleKey: 'titles.products' }
  },
  { 
    path: 'add', 
    component: AddProduct,
    data: { titleKey: 'titles.addProduct' }
  },
  { 
    path: 'anadir', 
    component: AddProduct,
    data: { titleKey: 'titles.addProduct' }
  }
];