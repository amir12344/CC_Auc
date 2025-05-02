export interface Seller {
  name: string;
  logo: string;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  shipping?: string;
  daysLeft?: number;
  isRefurbished?: boolean;
  isAlmostGone?: boolean;
  label?: string;
  category?: string;
  /** @deprecated Do not use hardcoded links. Use generateSlug() instead */
  link?: string;
  seller?: Seller;
  bids?: number;
  timeLeft?: string;
  description?: string;
  condition?: string;
}

