import { Routes } from "@angular/router";
import { Products } from "./pages/products/products";
import { AddProduct } from "./ui/add-product/add-product";
import { AddCategory } from "./pages/add-category/add-category";
import { LoadProducts } from "./pages/load-products/load-products";

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
  },
  {
    path: 'add-category',
    component: AddCategory,
    data: { titleKey: 'titles.addCategory' }
  },
  {
    path: 'anadir-categoria',
    component: AddCategory,
    data: { titleKey: 'titles.addCategory' }
  },
  {
    path: 'load-products',
    component: LoadProducts,
    data: { titleKey: 'titles.loadProducts' }
  },
  {
    path: 'cargar-productos',
    component: LoadProducts,
    data: { titleKey: 'titles.loadProducts' }
  }
];
