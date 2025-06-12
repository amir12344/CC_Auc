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
  status: 'active' | 'expired' | 'sold';
  endDate?: string;
}

export interface BuyerOffer {
  id: string;
  productId: string;
  productTitle: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export interface BuyerOrder {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: Address;
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

// Navigation Types
export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  items?: NavItem[];
} 