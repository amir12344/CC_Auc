import { Auction, ManifestItem } from '../types';

/**
 * Mock auction data for marketplace auction listings
 * Contains comprehensive auction items with detailed specifications for all UI components
 * Used for development and testing before API integration
 * 
 * Enhanced data includes:
 * - Complete auction details (bidding, shipping, manifest)
 * - Multiple images for gallery display
 * - Detailed specifications for accordion sections
 * - Manifest data for table display
 * - Realistic pricing and bidding information
 */

export const auctionListings: Auction[] = [
  {
    id: '1001',
    title: '2 Pallets of Owala 40oz Stainless Steel Straw Tumblers, New Condition, 492 Units, Ext. Retail $19,675, Franklin, IN',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    ],
    description: 'Please note: This inventory is case-packed! The primary image of the auction is for the representation of the category of goods. Product images are for representation only and actual items may vary in color, design, or condition. See full manifest for available product information.',
    category: 'BICYCLES-PHYSICAL FITNESS',
    condition: 'New Condition. Unsold merchandise with no signs of use.',
    seller: {
      name: 'CasePack Inventory',
      logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    location: '14500 JACKSON BROWNING LN, PFLUGERVILLE, Texas 78660-1045',
    currentBid: 5369,
    startingBid: 2000,
    endTime: '2025-06-20T19:00:00Z',
    totalBids: 9,
    timeLeft: '6h 26m',
    isActive: true,
    unitsAvailable: 492,
    shipping: '$694.36',
    additionalCharges: 214.76, // B-Stock Fee
    avgCostPerUnit: 10.91,
    extRetail: 19675,
    quantity: 492,
    productType: 'Stores Inventory',
    packaging: 'Original, Sealed, unopened packaging that may show signs of aging or contain stickers showing markdowns. Items include tags and may or may not be casepacked.',
    resaleRequirements: 'Delabeling and No exporting',
    biddingRequirements: 'All inventory is sold AS IS - WHERE IS. Select merchandise must be defaced and delabeled prior to the winning buyer selling, giving, or distributing merchandise to another party in accordance with Target\'s Defacing and De-labeling Guidelines.',
    manifest: [
      {
        itemNumber: 'LPHP247109',
        productClass: 'BICYCLES PHYSICAL FITNESS',
        category: 'BICYCLES-PHYSICAL FITNESS',
        brand: 'Owala',
        model: '',
        description: 'Owala 40oz Stainless Steel Straw Tumbler'
      },
      {
        itemNumber: 'LPHP247135',
        productClass: 'BICYCLES PHYSICAL FITNESS',
        category: 'BICYCLES-PHYSICAL FITNESS',
        brand: 'Owala',
        model: '',
        description: 'Owala 40oz Stainless Steel Straw Tumbler'
      }
    ],
    details: {
      'DESCRIPTION': 'Please note: This inventory is case-packed!',
      'CONDITION': 'New Condition. Unsold merchandise with no signs of use.',
      'COSMETIC CONDITION': 'Uninspected',
      'FUNCTIONALITY': 'Untested',
      'ACCESSORIES': 'Included',
      'QUANTITY': '492 Units',
      'EXT. RETAIL': '$19,675',
      'PRODUCT TYPE': 'Stores Inventory',
      'PACKAGING': 'Original, Sealed, unopened packaging that may show signs of aging or contain stickers showing markdowns. Items include tags and may or may not be casepacked.',
      'RESALE REQUIREMENTS': 'Delabeling and No exporting',
      'BIDDING REQUIREMENTS': 'All inventory is sold AS IS - WHERE IS.'
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Binding Shipping',
      'SHIP FROM': '46131 - Franklin, IN',
      'FREIGHT TYPE': 'LTL',
      'PIECE COUNT': '2',
      'ESTIMATED WEIGHT': '900.00 lbs',
      'PACKAGING': 'Pallets_48x40',
      'REFRIGERATED': 'No',
      'CONTAINS HAZARDOUS MATERIALS?': 'No',
      'PALLET SPACES': '2',
      'SHIPPING NOTES': 'This lot will have 2 pallets across 2 pallet spaces.',
      'DIMENSIONS': 'W 40" L 48" H 60"'
    }
  },
  {
    id: '1002',
    title: 'Vintage Electronics Lot - 150 Units Mixed Consumer Electronics',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3'
    ],
    description: 'Mixed lot of consumer electronics including headphones, speakers, cables, and accessories. Various conditions, perfect for resellers.',
    category: 'Electronics',
    condition: 'Mixed Condition',
    seller: {
      name: 'Electronics Liquidators',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    location: 'Los Angeles, CA',
    currentBid: 425.00,
    startingBid: 200.00,
    endTime: '2024-12-24T20:15:00Z',
    totalBids: 8,
    timeLeft: '1 day 7 hours',
    isActive: true,
    unitsAvailable: 150,
    shipping: '$45.00',
    additionalCharges: 85.00,
    avgCostPerUnit: 2.83,
    extRetail: 7500,
    quantity: 150,
    productType: 'Customer Returns',
    packaging: 'Gaylord boxes',
    resaleRequirements: 'No restrictions',
    biddingRequirements: 'Standard terms apply',
    manifest: [
      {
        itemNumber: 'ELC001',
        productClass: 'ELECTRONICS',
        category: 'AUDIO',
        brand: 'Various',
        model: 'Mixed',
        description: 'Headphones and Earbuds'
      },
      {
        itemNumber: 'ELC002',
        productClass: 'ELECTRONICS',
        category: 'ACCESSORIES',
        brand: 'Various',
        model: 'Mixed',
        description: 'Cables and Adapters'
      }
    ],
    details: {
      'DESCRIPTION': 'Mixed lot of consumer electronics',
      'CONDITION': 'Mixed - Customer Returns',
      'COSMETIC CONDITION': 'Varies',
      'FUNCTIONALITY': 'Mixed - Testing Required',
      'ACCESSORIES': 'May be incomplete',
      'QUANTITY': '150 Units',
      'EXT. RETAIL': '$7,500',
      'PRODUCT TYPE': 'Customer Returns'
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Standard Shipping',
      'SHIP FROM': '90210 - Los Angeles, CA',
      'FREIGHT TYPE': 'Ground',
      'PIECE COUNT': '3',
      'ESTIMATED WEIGHT': '200.00 lbs',
      'PACKAGING': 'Gaylord Boxes',
      'REFRIGERATED': 'No',
      'CONTAINS HAZARDOUS MATERIALS?': 'No'
    }
  },
  {
    id: '1003',
    title: 'Apple MacBook Pro Collection - 25 Units Mixed Models',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    ],
    description: 'Collection of MacBook Pro laptops, various models and years. Customer returns and overstock items.',
    category: 'Computers',
    condition: 'Mixed Condition',
    seller: {
      name: 'TechHub Auctions',
      logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    location: 'Austin, TX',
    currentBid: 12850.00,
    startingBid: 8000.00,
    endTime: '2024-12-26T14:45:00Z',
    totalBids: 23,
    timeLeft: '3 days 1 hour',
    isActive: true,
    unitsAvailable: 25,
    shipping: 'Free shipping',
    additionalCharges: 642.50,
    avgCostPerUnit: 514.00,
    extRetail: 62500,
    quantity: 25,
    productType: 'Customer Returns',
    packaging: 'Individual boxes',
    resaleRequirements: 'No restrictions',
    biddingRequirements: 'AS IS - WHERE IS',
    manifest: [
      {
        itemNumber: 'MBP001',
        productClass: 'COMPUTERS',
        category: 'LAPTOPS',
        brand: 'Apple',
        model: 'MacBook Pro 13"',
        description: 'MacBook Pro 13" M1 Chip'
      },
      {
        itemNumber: 'MBP002',
        productClass: 'COMPUTERS',
        category: 'LAPTOPS',
        brand: 'Apple',
        model: 'MacBook Pro 16"',
        description: 'MacBook Pro 16" Intel i7'
      }
    ],
    details: {
      'DESCRIPTION': 'Collection of MacBook Pro laptops',
      'CONDITION': 'Mixed - Customer Returns',
      'COSMETIC CONDITION': 'Varies by unit',
      'FUNCTIONALITY': 'Mixed - Individual testing required',
      'ACCESSORIES': 'May include chargers',
      'QUANTITY': '25 Units',
      'EXT. RETAIL': '$62,500',
      'PRODUCT TYPE': 'Customer Returns'
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Free Shipping',
      'SHIP FROM': '78701 - Austin, TX',
      'FREIGHT TYPE': 'Ground',
      'PIECE COUNT': '5',
      'ESTIMATED WEIGHT': '150.00 lbs',
      'PACKAGING': 'Individual Boxes',
      'REFRIGERATED': 'No',
      'CONTAINS HAZARDOUS MATERIALS?': 'No'
    }
  }
];

/**
 * Helper function to get auction by ID
 * Used by auction detail pages to fetch specific auction data
 * 
 * @param id - The auction ID to search for
 * @returns Auction object or undefined if not found
 */
export const getAuctionById = (id: string): Auction | undefined => {
  return auctionListings.find(auction => auction.id === id);
};

/**
 * Helper function to get active auctions only
 * Filters out inactive/ended auctions for marketplace display
 * 
 * @returns Array of active auctions
 */
export const getActiveAuctions = (): Auction[] => {
  return auctionListings.filter(auction => auction.isActive);
};

/**
 * Helper function to get auction manifest data
 * Extracts manifest items for table display
 * 
 * @param auctionId - The auction ID
 * @returns Array of manifest items or empty array
 */
export const getAuctionManifest = (auctionId: string): ManifestItem[] => {
  const auction = getAuctionById(auctionId);
  return auction?.manifest || [];
}; 