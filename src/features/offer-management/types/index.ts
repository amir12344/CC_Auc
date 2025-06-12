// Offer Management Types
export interface OfferVariant {
  id: string;
  name: string;
  upc?: string;
  asin?: string;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
  checked: boolean;
}

export interface OfferItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  offeredPrice: number;
  msrp: number;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

export interface OfferState {
  productId: string | null;
  productTitle: string;
  variants: OfferVariant[];
  open: boolean;
}

export interface OfferCartState {
  items: OfferItem[];
  totalValue: number;
  totalQuantity: number;
  isSubmitting: boolean;
  error: string | null;
}

export interface OfferSubmissionPayload {
  buyerId: string;
  sellerId: string;
  items: OfferItem[];
  message?: string;
  expirationDate?: Date;
}

export interface OfferResponse {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  submittedAt: Date;
  expiresAt?: Date;
  buyerId: string;
  sellerId: string;
  items: OfferItem[];
  message?: string;
  response?: {
    message: string;
    counterOffer?: OfferItem[];
    respondedAt: Date;
  };
} 