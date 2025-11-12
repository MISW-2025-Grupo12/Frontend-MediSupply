export interface ProductOrder {
  id: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}