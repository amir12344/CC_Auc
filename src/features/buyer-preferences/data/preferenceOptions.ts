import { PreferenceStep } from '../types/preferences';

// Brand options - expanded list
export const BRAND_OPTIONS = [
  'Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'LG', 'Lulu Dharma', 'Lulu and Georgia',
  'West Elm', 'Pottery Barn', 'Williams Sonoma', 'Target', 'Home Depot', 'Lowes',
  'Coach', 'Michael Kors', 'Kate Spade', 'Tory Burch', 'Marc Jacobs', 'Calvin Klein',
  'Tommy Hilfiger', 'Ralph Lauren', 'Under Armour', 'Puma', 'New Balance', 'Converse',
  'Vans', 'Reebok', 'Jordan', 'Levi\'s', 'Gap', 'Old Navy', 'Banana Republic',
  'J.Crew', 'Ann Taylor', 'Loft', 'Express', 'H&M', 'Zara', 'Forever 21',
  'Urban Outfitters', 'American Eagle', 'Hollister', 'Abercrombie & Fitch'
];

// Category options - expanded list
export const CATEGORY_OPTIONS = [
  'Accessories/Tools', 'Bath & Body', 'Haircare', 'Makeup', 'Skincare', 'Food', 'Active Gear',
  'Bedding & Bath', 'Decor', 'Electronics', 'Furniture', 'Housewares', 'Luggage', 'Pantry',
  'Paper & Novelty', 'Pet', 'Tools & Home Improvement', 'Toys', 'Vitamins & Supplements', 'Window',
  'Apparel - Women', 'Apparel - Men', 'Apparel - Kids', 'Shoes', 'Jewelry', 'Watches',
  'Books', 'Music', 'Movies', 'Games', 'Sports & Outdoors', 'Automotive', 'Baby & Kids',
  'Health & Personal Care', 'Office Supplies', 'Garden & Patio', 'Arts & Crafts'
];

// Subcategory options based on categories
export const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  'Accessories/Tools': ['Handbags', 'Belts', 'Scarves', 'Hats', 'Sunglasses', 'Hand Tools', 'Power Tools'],
  'Bath & Body': ['Body Wash', 'Lotions', 'Bath Bombs', 'Soaps', 'Body Scrubs', 'Essential Oils'],
  'Haircare': ['Shampoo', 'Conditioner', 'Hair Styling', 'Hair Tools', 'Hair Color', 'Hair Treatments'],
  'Makeup': ['Foundation', 'Concealer', 'Eye Makeup', 'Lip Products', 'Brushes', 'Nail Polish'],
  'Skincare': ['Cleansers', 'Moisturizers', 'Serums', 'Masks', 'Sunscreen', 'Anti-Aging'],
  'Food': ['Snacks', 'Beverages', 'Organic', 'Gluten-Free', 'Specialty Foods', 'International'],
  'Electronics': ['Phones', 'Tablets', 'Laptops', 'TV & Audio', 'Gaming', 'Smart Home', 'Wearables'],
  'Apparel - Women': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Intimates', 'Sleepwear', 'Activewear'],
  'Apparel - Men': ['Shirts', 'Pants', 'Suits', 'Outerwear', 'Underwear', 'Sleepwear', 'Activewear'],
  'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Dress Shoes', 'Athletic Shoes', 'Casual Shoes'],
  'Toys': ['Action Figures', 'Board Games', 'Educational', 'Outdoor Play', 'Arts & Crafts', 'Electronic']
};

// Discount options
export const DISCOUNT_OPTIONS = [
  { value: 'no-preference', label: 'No preference' },
  { value: '10-20', label: '10-20%' },
  { value: '20-30', label: '20-30%' },
  { value: '30-50', label: '30-50%' },
  { value: '50-70', label: '50-70%' },
  { value: '70-plus', label: '70%+' }
];

// Selling platform details
export const SELLING_PLATFORM_DETAILS = {
  discountRetail: {
    title: 'Discount Retail',
    description: 'Traditional discount retail stores and chains',
    examples: 'TJ Maxx, Marshall\'s, Nordstrom Rack'
  },
  stockX: {
    title: 'StockX',
    description: 'Sneakers, streetwear, and collectibles marketplace',
    examples: 'Reselling authenticated products'
  },
  amazonWalmart: {
    title: 'Amazon or Walmart',
    description: 'Major online marketplace platforms',
    examples: 'FBA, Walmart Marketplace'
  },
  liveMarketplaces: {
    title: 'Live Seller Marketplaces',
    description: 'Real-time selling platforms with live interaction',
    examples: 'Whatnot, TikTok Shop, Facebook Live, Instagram Live'
  },
  resellerMarketplaces: {
    title: 'Reseller Marketplaces',
    description: 'Peer-to-peer reselling platforms',
    examples: 'Poshmark, Depop, Mercari, Vinted, TheRealReal'
  },
  offPriceRetail: {
    title: 'Off-Price Retail',
    description: 'Retail stores specializing in discounted merchandise',
    examples: 'Outlet stores, warehouse clubs'
  },
  export: {
    title: 'Export',
    description: 'International wholesale and export business',
    examples: 'Bulk export to other countries'
  },
  refurbisher: {
    title: 'Refurbisher / Repair Shop',
    description: 'Repair and refurbish products for resale',
    examples: 'Electronics repair, furniture restoration'
  }
};

// Step configuration - consolidated selling platforms into one step
export const PREFERENCE_STEPS: PreferenceStep[] = [
  {
    id: 'auction-catalog',
    title: 'What type of listing do you prefer?',
    description: 'Choose between auction or catalog listings',
    component: 'AuctionCatalogStep',
    isRequired: false
  },
  {
    id: 'where-you-sell',
    title: 'Where do you sell?',
    description: 'Select all the platforms and channels where you sell products',
    component: 'WhereYouSellStep',
    isRequired: false
  },
  {
    id: 'categories',
    title: 'What categories do you prefer?',
    description: 'Choose the product categories and subcategories that interest you most',
    component: 'CategoryStep',
    isRequired: false
  },
  {
    id: 'brands',
    title: 'What brands do you prefer?',
    description: 'Select the brands you\'re most interested in buying',
    component: 'BrandsStep',
    isRequired: false
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    description: 'Set your preferred price range per item',
    component: 'BudgetStep',
    isRequired: false
  },
];

// Default preferences
export const DEFAULT_PREFERENCES = {
  brands: [],
  categories: [],
  subcategories: [],
  minBudget: null,
  maxBudget: null,
  minimumDiscount: 'no-preference',
  preferredTypes: [],
  sellingPlatforms: {
    discountRetail: false,
    stockX: false,
    amazonWalmart: false,
    liveMarketplaces: false,
    resellerMarketplaces: false,
    offPriceRetail: false,
    export: false,
    refurbisher: false
  },
  isCompleted: false
}; 