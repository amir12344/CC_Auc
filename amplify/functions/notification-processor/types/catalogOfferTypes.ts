// Type definitions for catalog offer Excel export functionality

export interface CatalogOfferData {
  offerId: string;
  publicId: string;
  catalogListing: {
    catalogListingId: string;
    title: string;
    description?: string;
    category?: string;
    subcategory?: string;
  };
  sellerInfo: {
    userId: string;
    email: string;
    name: string;
    profileId: string;
    companyName?: string;
  };
  buyerInfo: {
    userId: string;
    email: string;
    name: string;
    profileId: string;
    companyName?: string;
  };
  offerStatus: string;
  totalOfferValue: number;
  totalOfferValueCurrency: string;
  currentRound: number;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  offerMessage?: string;
  items: CatalogOfferItem[];
}

export interface CatalogOfferItem {
  itemId: string;
  publicId: string;
  catalogProduct: {
    productId: string;
    productName: string;
    brandName?: string;
    category?: string;
    subcategory?: string;
    description?: string;
  };
  catalogProductVariant?: {
    variantId: string;
    variantName: string;
    variantSku: string;
    retailPrice?: number;
    currency?: string;
    packaging?: string;
    condition?: string;
    identifier?: string;
    identifierType?: string;
    imageS3Key?: string;
  };
  requestedQuantity: number;
  sellerOfferPrice?: number;
  sellerOfferPriceCurrency?: string;
  buyerOfferPrice?: number;
  buyerOfferPriceCurrency?: string;
  negotiationStatus: string;
  itemStatus: string;
  finalAgreedPrice?: number;
  finalAgreedPriceCurrency?: string;
  finalAgreedQuantity?: number;
}

export interface CatalogOfferExcelRow {
  productName: string;
  variantName: string;
  brandName: string;
  variantSku: string;
  requestedQuantity: number;
  sellerOfferPrice: number;
  sellerOfferPriceCurrency: string;
  buyerOfferPrice: number;
  buyerOfferPriceCurrency: string;
  retailPrice: number;
  totalBuyerOffer: number;
  totalSellerOffer: number;
  buyerDiscountPercent: number;
  sellerDiscountPercent: number;
  negotiationStatus: string;
  category: string;
  subcategory: string;
  packaging: string;
  condition: string;
  identifier: string;
  identifierType: string;
  imageS3Key?: string;
  imageBase64?: string;
}

export interface ExcelExportConfig {
  fileName: string;
  sheetName: string;
  recipientType: "BUYER" | "SELLER";
  includeImages: boolean;
  includeNegotiationHistory: boolean;
}

export interface ExcelExportResult {
  success: boolean;
  fileName?: string;
  fileBuffer?: Buffer;
  fileSize?: number;
  error?: string;
  warnings?: string[];
}

export interface ExcelGenerationProgress {
  stage:
    | "initializing"
    | "fetching_data"
    | "processing_images"
    | "generating_excel"
    | "complete"
    | "error";
  progress: number;
  message: string;
  currentOperation?: string;
}
