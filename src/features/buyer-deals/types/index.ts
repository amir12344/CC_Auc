// Buyer Deals Types
// Types related to buyer deals functionality and messaging

// Deals Types
export interface DealsMetrics {
  totalDeals: number;
  activeOffers: number;
  completedOrders: number;
  savedItems: number;
}

// Buyer Offers Types
export interface BuyerOffer {
  id: string;
  offerStatus: string;
  totalOfferValue: number;
  currency: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
}

// API response structure for individual offer
export interface BuyerOfferData {
  public_id: string;
  offer_status: string;
  total_offer_value: string; // Changed from number to string to match API response
  total_offer_value_currency: string;
  catalog_listings: {
    title: string;
    description: string;
    category: string;
    catalog_listing_images: Array<{ images: { s3_key: string } }>;
  };
}

// API response structure from the users query (with nested offers)
export interface BuyerOfferApiResponse {
  catalog_offers_catalog_offers_buyer_user_idTousers: BuyerOfferData[];
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

export interface BuyerOrder {
  id: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  currency: string;
  orderDate: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  trackingNumber?: string;
  variantName?: string;
}

// Detailed order information for view order sheet
export interface BuyerOrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: string;
  orderType: string; // CATALOG or AUCTION
  totalAmount: number;
  currency: string;
  shippingCost?: number;
  taxAmount?: number;
  paymentDueDate?: string;
  shippingDate?: string;
  deliveryDate?: string;
  orderDate: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  orderItems: BuyerOrderItem[];
}

// Individual order item details
export interface BuyerOrderItem {
  id: string;
  productTitle: string;
  variantName?: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  imageUrl?: string;
}

// API response structure for individual order
export interface BuyerOrderData {
  public_id: string;
  order_number: string;
  order_status: string;
  total_amount: string;
  total_amount_currency: string;
  created_at: string;
  catalog_offers?: {
    catalog_listings: {
      title: string;
      description: string;
      category: string;
      catalog_listing_images: Array<{ images: { s3_key: string } }>;
    };
  };
  auction_listings?: {
    title: string;
    description: string;
    category: string;
    auction_listing_images: Array<{ images: { s3_key: string } }>;
  };
  order_items?: Array<{
    catalog_products?: {
      title: string;
      sku: string;
    };
    catalog_product_variants?: {
      variant_name: string;
      variant_sku: string;
      catalog_products: {
        title: string;
        sku: string;
      };
    };
    auction_listing_product_manifests?: {
      title: string;
      sku: string;
      auction_listings?: {
        title: string;
        description: string;
        category: string;
        auction_listing_images: Array<{ images: { s3_key: string } }>;
      };
    };
  }>;
}

// API response structure for detailed order with items
export interface BuyerOrderDetailsData {
  public_id: string;
  order_number: string;
  order_status: string;
  order_type: string;
  total_amount: string;
  total_amount_currency: string;
  shipping_cost?: string;
  tax_amount?: string;
  payment_due_date?: string;
  shipping_date?: string;
  delivery_date?: string;
  created_at: string;
  catalog_offers?: {
    catalog_listings: {
      title: string;
      description: string;
      category: string;
      catalog_listing_images: Array<{ images: { s3_key: string } }>;
    };
  };
  auction_listings?: {
    title: string;
    description: string;
    category: string;
    auction_listing_images: Array<{ images: { s3_key: string } }>;
  };
  order_items: Array<{
    order_item_id: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    total_price_currency: string;
    catalog_products?: {
      title: string;
      sku: string;
    };
    catalog_product_variants?: {
      variant_name: string;
      variant_sku: string;
      catalog_products: {
        title: string;
        sku: string;
      };
      catalog_product_variant_images: Array<{ images: { s3_key: string } }>;
    };
    auction_listing_product_manifests?: {
      title: string;
      sku: string;
      auction_listings?: {
        auction_listing_images: Array<{ images: { s3_key: string } }>;
      };
    };
  }>;
}

// API response structure from the users query (with nested orders)
export interface BuyerOrderApiResponse {
  orders_orders_buyer_user_idTousers: BuyerOrderData[];
}

export interface OrderItem {
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
  icon: React.ComponentType<any>;
}

// Buyer Bids Types
export interface BuyerBid {
  id: string;
  bidAmount: number;
  currency: string;
  bidTimestamp: string;
  isWinningBid: boolean;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  auctionStatus: string;
  auctionEndTime?: string;
  // Added listingId to uniquely group bids by auction listing
  listingId?: string;
  // Added action_type from auction_bid_history to determine bid status
  actionType?: string;
}

// API response structure for individual bid
export interface BuyerBidData {
  public_id: string;
  bid_amount: string;
  bid_amount_currency: string;
  bid_timestamp: string;
  is_winning_bid: boolean;
  auction_listings: {
    auction_listing_id?: string;
    title: string;
    description: string;
    category: string;
    auction_status: string;
    auction_end_time?: string;
    auction_listing_images: Array<{ images: { s3_key: string } }>;
    // Added to fetch the latest action_type from auction_bid_history
    auction_bid_history?: Array<{
      action_type: string;
      timestamp: string;
    }>;
  };
}

// API response structure from the users query (with nested bids)
export interface BuyerBidApiResponse {
  auction_bids: BuyerBidData[];
}

// Navigation Types
export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  items?: NavItem[];
}
