// API-related constants
export const API_LIMITS = {
  DEFAULT_TAKE: 10,
  MAX_BATCH_SIZE: 50,
} as const;

export const S3_CONFIG = {
  BUCKET_NAME: "commerce-central-images",
  USE_ACCELERATE: true,
} as const;

export const QUERY_KEYS = {
  SELLER_OFFERS: ["sellerOffers"] as const,
  ORDER_ITEMS: (offerId: string) => ["orderItems", offerId] as const,
  ORDER_DETAILS: (orderId: string) => ["orderDetails", orderId] as const,
  OFFER_DETAILS: (offerId: string) => ["offerDetails", offerId] as const,
} as const;
