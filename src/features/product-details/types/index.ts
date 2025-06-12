export interface ProductVariant {
  id: string;
  imageUrl?: string;
  productName: string;
  variants: number;
  msrp: number;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  variants: ProductVariant[];
} 