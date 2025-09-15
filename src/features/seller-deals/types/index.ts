// Buyer Deals Types
// Types related to buyer deals functionality and messaging

// Deals Types
export interface DealsMetrics {
  totalDeals: number;
  activeOffers: number;
  completedOrders: number;
  savedItems: number;
}

export interface Deal {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  status: "active" | "expired" | "sold";
  endDate?: string;
}

// Seller Offers Types
export interface SellerOffer {
  id: string;
  catalog_offer_id: string;
  catalogListingPublicId: string;
  offerStatus: "pending" | "accepted" | "rejected" | "expired" | "cancelled";
  totalOfferValue: number | null;
  currency: "USD" | "EUR" | "GBP" | "CAD";
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  buyerEmail: string;
  shippingAddressPublicId: string | null;
  billingAddressPublicId: string | null;
}

// API response structure for individual seller offer
export interface SellerOfferData {
  public_id: string;
  catalog_offer_id: string;
  offer_status: string;
  total_offer_value: string;
  total_offer_value_currency: string;
  catalog_listings: {
    public_id: string;
    title: string;
    description: string;
    category: string;
    catalog_listing_images: Array<{ images: { s3_key: string } }>;
  };
  users_catalog_offers_buyer_user_idTousers?: {
    email: string;
    user_addresses: Array<{
      address_type: string;
      addresses: {
        public_id: string;
      };
    }>;
  };
}

// API response structure from the users query (with nested offers)
export interface SellerOfferApiResponse {
  catalog_offers_catalog_offers_buyer_user_idTousers: SellerOfferData[];
}

export interface BuyerOffer {
  id: string;
  productId: string;
  productTitle: string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  expiresAt?: string;
}

export interface BuyerOrder {
  id: string;
  items: LegacyOrderItem[];
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  shippingAddress: Address;
}

export interface SellerOrderItem {
  variantId: string;
  catalogProductVariantPublicId: string; // ✅ The public_id from catalog_product_variants for API calls
  variantName: string;
  variantSku: string;
  productTitle: string;
  imageUrl: string | null;
  requestedQuantity: number;
  buyerOfferPrice: number;
  retailPrice?: number; // For % off calculation
  currency: string;
  isBuyerSelection: boolean; // Distinguishes buyer vs seller additions
  catalogOfferItemPublicId: string;
}

// API response structure for order items data
export interface OrderItemsData {
  offer_status: string;
  total_offer_value: string;
  total_offer_value_currency: string;
  catalog_offer_items: Array<{
    public_id: string;
    requested_quantity: number;
    buyer_offer_price: string;
    buyer_offer_price_currency: string;
    catalog_product_variants: {
      public_id: string; // ✅ The correct public_id field needed for API calls
      catalog_products: {
        title: string;
      };
      variant_name: string;
      variant_sku: string;
      retail_price?: string; // For % off calculation
      catalog_product_variant_id: string;
      catalog_product_variant_images: Array<{
        images: { s3_key: string };
      }>;
    };
  }>;
}

// Legacy OrderItem interface for backward compatibility
export interface LegacyOrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Messaging Types (enhanced from original)
export interface Mail {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
}

export interface Account {
  label: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Catalog Listing Variants Types
export interface CatalogListingVariant {
  public_id: string;
  title: string;
  available_quantity: number;
  retail_price: string;
  offer_price: string;
  variant_name: string;
  variant_sku: string;
  identifier: string;
  identifier_type: string;
  imageUrl: string | null;
  productTitle: string;
}

// API response structure for catalog listing variants
export interface CatalogListingVariantsData {
  public_id: string;
  title: string;
  catalog_products: Array<{
    title: string;
    catalog_product_variants: Array<{
      public_id: string;
      title: string;
      available_quantity: number;
      retail_price: string;
      offer_price: string;
      variant_name: string;
      variant_sku: string;
      identifier: string;
      identifier_type: string;
      catalog_product_variant_images: Array<{
        images: { s3_key: string };
      }>;
    }>;
  }>;
}

// Enhanced SellerOrderItem to support both buyer selections and seller additions
export interface EnhancedSellerOrderItem extends SellerOrderItem {
  id: string; // Unique identifier for the row
  isSellerAddition: boolean; // True if added by seller via "Add More Variants"
  catalogListingPublicId?: string; // For seller additions
  availableQuantity?: number; // For seller additions
  retailPrice?: number; // For % off calculation - override for optional
}

// Navigation Types
export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  isActive?: boolean;
  items?: NavItem[];
}

// Create Order API Types
export interface ModificationItem {
  action: "UPDATE_EXISTING" | "ADD_PRODUCT" | "REMOVE_PRODUCT";
  catalogOfferItemPublicId?: string; // Optional for seller additions (ADD_PRODUCT) or required for REMOVE_PRODUCT
  catalogProductVariantPublicId?: string; // Required for ADD_PRODUCT and UPDATE_EXISTING, not for REMOVE_PRODUCT
  quantity?: number; // Required for ADD_PRODUCT and UPDATE_EXISTING, not for REMOVE_PRODUCT
  sellerPricePerUnit?: number; // Required for ADD_PRODUCT and UPDATE_EXISTING, not for REMOVE_PRODUCT
  newQuantity?: number; // Required for UPDATE_EXISTING, not for ADD_PRODUCT or REMOVE_PRODUCT
  newSellerPricePerUnit?: number; // Required for UPDATE_EXISTING, not for ADD_PRODUCT or REMOVE_PRODUCT
  modificationReason?: string;
}

export interface CreateOrderPayload {
  offerPublicId: string;
  sellerMessage?: string;
  autoCreateOrder: boolean;
  shippingAddressPublicId: string;
  billingAddressPublicId: string;
  orderNotes?: string;
  modifications: ModificationItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  errors?: string[];
  message?: string; // Success message from API response
}
