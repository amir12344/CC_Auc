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