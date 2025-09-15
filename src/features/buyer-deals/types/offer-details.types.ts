import type { BuyerOffer } from "./index";

export interface BuyerOfferItem {
  id: string;
  productTitle: string;
  variantName: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  imageUrl?: string;
}

export interface BuyerOfferDetails extends BuyerOffer {
  createdAt: string;
  offerItems: BuyerOfferItem[];
}
