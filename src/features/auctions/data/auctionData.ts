import type { Auction, ManifestItem } from '../types';

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
    title:
      'osie Maran Assorted Argan Oil Beauty & Skincare Lot – Body Butters, Oils, Masks, Lip & Cheek (Sealed Units)',
    image:
      'https://www.josiemaran.com/cdn/shop/files/whipped-argan-oil-body-butter-6oz-always-nude-2048x2048_b1999fd9-e6ae-49ee-ade7-6e6deef2b955.png',
    images: [
      'https://www.josiemaran.com/cdn/shop/files/whipped-argan-oil-body-butter-6oz-always-nude-2048x2048_b1999fd9-e6ae-49ee-ade7-6e6deef2b955.png',
    ],
    description:
      'Case-packed lot of brand new Owala 40oz tumblers. Perfect for resellers. See manifest for color/style breakdown if available. Product images are for representation only and actual items may vary in color, design, or condition.',
    category: 'Home Goods & Kitchen',
    condition: 'New Condition. Unsold merchandise with no signs of use.',
    seller: {
      name: 'CasePack Inventory',
      logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
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
    extRetail: 19_675,
    quantity: 492,
    productType: 'Stores Inventory',
    packaging:
      'Original, Sealed, unopened packaging that may show signs of aging or contain stickers showing markdowns. Items include tags and may or may not be casepacked.',
    resaleRequirements: 'Delabeling and No exporting',
    biddingRequirements:
      'All inventory is sold AS IS - WHERE IS. Select merchandise must be defaced and delabeled prior to the winning buyer selling, giving, or distributing merchandise to another party.',
    manifest: [
      {
        itemNumber: 'LPHP247109',
        productClass: 'HOME GOODS',
        category: 'DRINKWARE',
        brand: 'Owala',
        model: '',
        description: 'Owala 40oz Stainless Steel Straw Tumbler',
      },
      {
        itemNumber: 'LPHP247135',
        productClass: 'HOME GOODS',
        category: 'DRINKWARE',
        brand: 'Owala',
        model: '',
        description: 'Owala 40oz Stainless Steel Straw Tumbler',
      },
    ],
    details: {
      DESCRIPTION: 'Please note: This inventory is case-packed!',
      CONDITION: 'New Condition. Unsold merchandise with no signs of use.',
      'COSMETIC CONDITION': 'Uninspected',
      FUNCTIONALITY: 'Untested',
      ACCESSORIES: 'Included',
      QUANTITY: '492 Units',
      'EXT. RETAIL': '$19,675',
      'PRODUCT TYPE': 'Stores Inventory',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Binding Shipping',
      'SHIP FROM': '46131 - Franklin, IN',
      'FREIGHT TYPE': 'LTL',
      'PIECE COUNT': '2',
      'ESTIMATED WEIGHT': '900.00 lbs',
      PACKAGING: 'Pallets_48x40',
      'PALLET SPACES': '2',
      DIMENSIONS: 'W 40" L 48" H 60"',
    },
  },
  {
    id: '1002',
    title: 'Vintage Electronics Lot - 150 Units Mixed Consumer Electronics',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3',
    ],
    description:
      'Mixed lot of consumer electronics including headphones, speakers, cables, and accessories. Various conditions, perfect for resellers.',
    category: 'Electronics',
    condition: 'Mixed Condition',
    seller: {
      name: 'Electronics Liquidators',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3',
    },
    location: 'Los Angeles, CA',
    currentBid: 425.0,
    startingBid: 200.0,
    endTime: '2024-12-24T20:15:00Z',
    totalBids: 8,
    timeLeft: '1 day 7 hours',
    isActive: true,
    unitsAvailable: 150,
    shipping: '$45.00',
    additionalCharges: 85.0,
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
        description: 'Headphones and Earbuds',
      },
    ],
    details: {
      DESCRIPTION: 'Mixed lot of consumer electronics',
      CONDITION: 'Mixed - Customer Returns',
      'COSMETIC CONDITION': 'Varies',
      FUNCTIONALITY: 'Mixed - Testing Required',
      ACCESSORIES: 'May be incomplete',
      QUANTITY: '150 Units',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Standard Shipping',
      'SHIP FROM': '90210 - Los Angeles, CA',
      'FREIGHT TYPE': 'Ground',
      'ESTIMATED WEIGHT': '200.00 lbs',
    },
  },
  {
    id: '1004',
    title: 'Luxury Designer Handbags - 50 Units, Mixed Brands',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1590779720067-133a72a3e144?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    description:
      'An assortment of high-end designer handbags from major luxury brands. Includes a mix of styles, from totes to clutches. Shelf-pulls and overstock.',
    category: 'Fashion & Apparel',
    condition: 'New & Shelf-pulls',
    seller: {
      name: 'Prestige Liquidators',
      logo: 'https://plus.unsplash.com/premium_photo-1680373887550-f472f88a873f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    location: 'New York, NY',
    currentBid: 7500.0,
    startingBid: 5000.0,
    endTime: '2024-12-28T18:00:00Z',
    totalBids: 15,
    timeLeft: '5 days 5 hours',
    isActive: true,
    unitsAvailable: 50,
    shipping: '$150.00',
    additionalCharges: 375.0,
    avgCostPerUnit: 150.0,
    extRetail: 50_000,
    quantity: 50,
    productType: 'Overstock',
    packaging: 'Individual dust bags, boxed',
    resaleRequirements: 'None',
    biddingRequirements: 'Standard terms apply',
    manifest: [
      {
        itemNumber: 'HBG01',
        productClass: 'FASHION',
        category: 'HANDBAGS',
        brand: 'Mixed Brands',
        model: 'Tote',
        description: 'Assorted Leather Totes',
      },
      {
        itemNumber: 'HBG02',
        productClass: 'FASHION',
        category: 'HANDBAGS',
        brand: 'Mixed Brands',
        model: 'Crossbody',
        description: 'Assorted Crossbody Bags',
      },
    ],
    details: {
      DESCRIPTION: 'Assortment of high-end designer handbags',
      CONDITION: 'New and Shelf-Pulls',
      'COSMETIC CONDITION': 'Excellent, may have minor handling signs',
      FUNCTIONALITY: 'N/A',
      ACCESSORIES: 'Included',
      QUANTITY: '50 Units',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Standard Shipping',
      'SHIP FROM': '10001 - New York, NY',
      'FREIGHT TYPE': 'Ground',
      'ESTIMATED WEIGHT': '75.00 lbs',
    },
  },
  {
    id: '1005',
    title: "Pallet of Assorted Kids' Toys - 500+ Units",
    image:
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1575394630018-424b3784620e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    description:
      'Large pallet of assorted toys from major brands. Includes action figures, dolls, board games, and more. Ideal for discount stores and flea market vendors.',
    category: 'Toys & Hobbies',
    condition: 'Customer Returns',
    seller: {
      name: 'Toy Liquidators Inc.',
      logo: 'https://images.unsplash.com/photo-1608889150919-a3421e4b9343?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    location: 'Atlanta, GA',
    currentBid: 950.0,
    startingBid: 500.0,
    endTime: '2024-12-29T22:00:00Z',
    totalBids: 18,
    timeLeft: '6 days 9 hours',
    isActive: true,
    unitsAvailable: 520,
    shipping: '$250.00',
    additionalCharges: 120.0,
    avgCostPerUnit: 1.83,
    extRetail: 10_400,
    quantity: 520,
    productType: 'Customer Returns',
    packaging: 'Gaylord',
    resaleRequirements: 'None',
    biddingRequirements: 'Standard terms apply',
    manifest: [
      {
        itemNumber: 'TOY-AF-01',
        productClass: 'TOYS',
        category: 'ACTION FIGURES',
        brand: 'Mixed',
        model: '',
        description: 'Assorted Action Figures',
      },
      {
        itemNumber: 'TOY-BG-01',
        productClass: 'TOYS',
        category: 'BOARD GAMES',
        brand: 'Mixed',
        model: '',
        description: 'Family Board Games',
      },
    ],
    details: {
      DESCRIPTION: 'Large pallet of assorted toys',
      CONDITION: 'Customer Returns',
      'COSMETIC CONDITION': 'Varies, some packaging may be damaged',
      FUNCTIONALITY: 'Untested',
      ACCESSORIES: 'May be incomplete',
      QUANTITY: '520 Units',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'LTL',
      'SHIP FROM': '30301 - Atlanta, GA',
      'FREIGHT TYPE': 'LTL',
      'ESTIMATED WEIGHT': '500.00 lbs',
      'PALLET SPACES': '1',
    },
  },
  {
    id: '1006',
    title: 'Tools & Home Improvement Lot - 2 Pallets',
    image:
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1609205278451-2dcc59680d47?w=800&h=800&fit=crop&crop=center&auto=format&q=80',
    ],
    description:
      'Two full pallets of mixed tools and home improvement items. Includes power tools, hand tools, and hardware. Overstock and shelf-pulls from a major retailer.',
    category: 'Home Improvement',
    condition: 'New & Overstock',
    seller: {
      name: 'Surplus Tools Direct',
      logo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    location: 'Dallas, TX',
    currentBid: 2100.0,
    startingBid: 1500.0,
    endTime: '2025-01-05T12:00:00Z',
    totalBids: 11,
    timeLeft: '12 days 23 hours',
    isActive: true,
    unitsAvailable: 300,
    shipping: 'Freight Quote Required',
    additionalCharges: 250.0,
    avgCostPerUnit: 7.0,
    extRetail: 15_000,
    quantity: 300,
    productType: 'Overstock',
    packaging: 'Palletized',
    resaleRequirements: 'None',
    biddingRequirements: 'AS IS - WHERE IS',
    manifest: [
      {
        itemNumber: 'TL-PT-01',
        productClass: 'TOOLS',
        category: 'POWER TOOLS',
        brand: 'Mixed Brands',
        model: '',
        description: 'Cordless Drills & Saws',
      },
      {
        itemNumber: 'TL-HT-01',
        productClass: 'TOOLS',
        category: 'HAND TOOLS',
        brand: 'Mixed Brands',
        model: '',
        description: 'Wrench Sets, Hammers, Screwdrivers',
      },
    ],
    details: {
      DESCRIPTION: 'Two full pallets of mixed tools',
      CONDITION: 'New & Overstock',
      'COSMETIC CONDITION': 'New in box or with tags',
      FUNCTIONALITY: 'Untested, expected to be functional',
      ACCESSORIES: 'Complete',
      QUANTITY: '300+ Units',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Freight',
      'SHIP FROM': '75201 - Dallas, TX',
      'FREIGHT TYPE': 'LTL',
      'PIECE COUNT': '2',
      'ESTIMATED WEIGHT': '1200.00 lbs',
      'PALLET SPACES': '2',
    },
  },
]

/**
 * Helper function to get auction by ID
 * Used by auction detail pages to fetch specific auction data
 *
 * @param id - The auction ID to search for
 * @returns Auction object or undefined if not found
 */
export const getAuctionById = (id: string): Auction | undefined => {
  return auctionListings.find((auction) => auction.id === id);
};

/**
 * Helper function to get active auctions only
 * Filters out inactive/ended auctions for marketplace display
 *
 * @returns Array of active auctions
 */
export const getActiveAuctions = (): Auction[] => {
  return auctionListings.filter((auction) => auction.isActive);
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
