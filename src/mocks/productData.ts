import { Product } from '@/src/shared/types/navigation'

// Spotlight Deal
export const spotlightDeal: Product[] = [
  {
    id: 'spotlight1',
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80',
    title: 'Dyson HS01 Airwrap Styler Complete | Prussian Blue/Rich Copper | Refurbished',
    price: 429.99,
    originalPrice: 599.99,
    discount: 28,
    shipping: 'Free shipping',
    daysLeft: 2,
    isRefurbished: true,
    category: 'Major Appliances',
    retailer: 'Best Buy Returns',
    unitsAvailable: 50,
    msrpDiscountPercent: 60
  }
]

// Trending Deals
export const trendingDeals: Product[] = [
  {
    id: 'trending1',
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80',
    title: 'Dyson Ball Animal 2 Origin Upright Vacuum | Blue | Certified Refurbished',
    price: 179.99,
    originalPrice: 299.99,
    discount: 40,
    shipping: 'Free shipping',
    isRefurbished: true,
    isAlmostGone: true,
    category: 'Home Appliances',
    retailer: 'Dyson',
    unitsAvailable: 45,
    msrpDiscountPercent: 40
  },
  {
    id: 'trending2',
    image: 'https://images.unsplash.com/photo-1596460107916-430662021049?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    title: 'Sony 65" 4K UHD Smart Google TV with HDR KD65X80K',
    price: 698.00,
    originalPrice: 999.99,
    discount: 30,
    shipping: 'Free shipping',
    isRefurbished: true,
    category: 'Electronics',
    retailer: 'Sony',
    unitsAvailable: 100,
    msrpDiscountPercent: 30
  },
  {
    id: 'trending3',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    title: 'Apple Watch Series 7 GPS 45mm Midnight Aluminum Case with Midnight Sport Band',
    price: 329.99,
    originalPrice: 429.99,
    discount: 23,
    shipping: 'Free shipping',
    isRefurbished: true,
    category: 'Electronics',
    retailer: 'Apple',
    unitsAvailable: 150,
    msrpDiscountPercent: 23
  },
  {
    id: 'trendingFootwear1',
    image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'ComfortStride Running Shoes',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    shipping: 'Free shipping',
    category: 'Performance Footwear',
    retailer: 'SportStyle Shoes',
    unitsAvailable: 150,
    msrpDiscountPercent: 25
  },
  {
    id: 'trendingBeauty1',
    image: 'https://images.unsplash.com/photo-1618120508902-c8d05e7985ee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Revitalizing Skin Serum',
    price: 45.50,
    originalPrice: 60.00,
    discount: 24,
    shipping: 'Free shipping',
    category: 'Natural Skincare',
    retailer: 'Pure Organics',
    unitsAvailable: 220,
    msrpDiscountPercent: 17
  }
]

// Featured Deals
export const featuredDeals: Product[] = [
  {
    id: 'featured1',
    image: 'https://images.unsplash.com/photo-1596460107916-430662021049?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    title: 'EcoFlow DELTA Pro 3600Wh Power Station',
    price: 1686.25,
    originalPrice: 2799.99,
    discount: 40,
    shipping: 'Free shipping',
    isRefurbished: true,
    isAlmostGone: true,
    label: 'HOT',
    category: 'Electronics',
    retailer: 'EcoFlow',
    unitsAvailable: 30,
    msrpDiscountPercent: 40
  },
  {
    id: 'featured2',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    title: 'Lenovo ThinkPad X1 Carbon Gen 10 14" WUXGA Laptop i7-1260P 16GB 512GB SSD',
    price: 999.99,
    originalPrice: 1599.99,
    discount: 37,
    shipping: 'Free shipping',
    isRefurbished: true,
    category: 'Computers',
    retailer: 'Lenovo',
    unitsAvailable: 65,
    msrpDiscountPercent: 37
  },
  {
    id: 'featured3',
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1477&q=80',
    title: 'Ninja DZ201 Foodi 8 Quart 6-in-1 DualZone 2-Basket Air Fryer',
    price: 139.99,
    originalPrice: 199.99,
    discount: 30,
    shipping: 'Free shipping',
    isRefurbished: true,
    category: 'Kitchen Tools',
    retailer: 'Kitchenware Wholesale',
    unitsAvailable: 500,
    msrpDiscountPercent: 50
  },
  {
    id: 'featured4',
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
    title: 'Bose QuietComfort 45 Wireless Noise Cancelling Headphones',
    price: 249.00,
    originalPrice: 329.00,
    discount: 24,
    shipping: 'Free shipping',
    isRefurbished: true,
    label: 'HOT',
    category: 'Audio Gadgets',
    retailer: 'SoundWave Audio',
    unitsAvailable: 95,
    msrpDiscountPercent: 30
  },
  {
    id: 'featuredAccessory1',
    image: 'https://images.unsplash.com/photo-1667284152823-0b07a791fb79?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Elegant Leather Strap Watch',
    price: 120.00,
    originalPrice: 180.00,
    discount: 33,
    label: 'NEW',
    shipping: 'Free shipping',
    category: 'Fashion Accessory',
    retailer: 'Accessory Co.',
    unitsAvailable: 235,
    msrpDiscountPercent: 33
  },
  {
    id: 'featuredFootwear1',
    image: 'https://images.unsplash.com/photo-1563635419376-78d400e5588e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Durable Hiking Boots',
    price: 150.00,
    originalPrice: 200.00,
    discount: 25,
    shipping: 'Free shipping',
    category: 'Outdoor Footwear',
    retailer: 'Outdoor Gear Pro',
    unitsAvailable: 180,
    msrpDiscountPercent: 25
  }
]

// More Deals
export const moreDeals: Product[] = [
  {
    id: 'more1',
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80',
    title: 'New Balance Unisex 530 White/Silver Running Shoes',
    price: 59.99,
    originalPrice: 99.99,
    discount: 40,
    shipping: 'Free shipping',
    label: 'SALE',
    category: 'Athletic Footwear',
    retailer: 'New Balance',
    unitsAvailable: 250,
    msrpDiscountPercent: 40
  },
  {
    id: 'more2',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    title: 'Burberry London Fabric by Burberry EDT Cologne for Men',
    price: 32.65,
    originalPrice: 75.00,
    discount: 56,
    shipping: 'Free shipping',
    isAlmostGone: true,
    category: 'Fragrance Beauty',
    retailer: 'Burberry',
    unitsAvailable: 100,
    msrpDiscountPercent: 56
  },
  {
    id: 'more3',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80',
    title: 'Hugo Man by Hugo Boss 4.2 oz EDT Cologne for Men New In Box',
    price: 32.89,
    originalPrice: 65.00,
    discount: 49,
    shipping: 'Free shipping',
    isAlmostGone: true,
    category: 'Fragrance Beauty',
    retailer: 'Hugo Boss',
    unitsAvailable: 60,
    msrpDiscountPercent: 49
  },
  {
    id: 'more4',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=729&q=80',
    title: 'PHONE 2024 Android Cheap Cell Phone Unlocked',
    price: 58.99,
    originalPrice: 84.27,
    discount: 30,
    shipping: 'Free shipping',
    isAlmostGone: true,
    label: 'HOT',
    category: 'Mobile Electronics',
    retailer: 'Mobile Direct',
    unitsAvailable: 300,
    msrpDiscountPercent: 30
  },
  {
    id: 'moreAccessory1',
    image: 'https://images.unsplash.com/photo-1680068099053-81f58fff58a1?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Sterling Silver Pendant Necklace',
    price: 75.00,
    originalPrice: 100.00,
    discount: 25,
    shipping: 'Free shipping',
    category: 'Wearable Accessory',
    retailer: 'Gadget Hub',
    unitsAvailable: 175,
    msrpDiscountPercent: 20
  },
  {
    id: 'moreBeauty1',
    image: 'https://plus.unsplash.com/premium_photo-1661726457110-c43a88d74567?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Pro Makeup Palette - Earth Tones',
    price: 39.99,
    originalPrice: 55.00,
    discount: 27,
    shipping: 'Free shipping',
    category: 'Cosmetics Beauty',
    retailer: 'Beauty Hub',
    unitsAvailable: 200,
    msrpDiscountPercent: 27
  }
]

// Bargain Listings
export const bargainListings: Product[] = [
  {
    id: 'bargain1',
    title: '15 Truckloads of Pioneer Woman Accent Chairs, Mint Condition, EXPORT ONLY',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Walmart',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/1200px-Walmart_logo.svg.png'
    },
    bids: 0,
    discount: 30,
    timeLeft: '1d 12h',
    category: 'Flash Auction',
    price: 4999,
    originalPrice: 7500,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'Walmart',
    unitsAvailable: 100,
    msrpDiscountPercent: 30
  },
  {
    id: 'bargain2',
    title: 'Truckload of Home Depot Appliances, 25 Pallets, Ext. Retail $82,000',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Home Depot',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/2560px-TheHomeDepot.svg.png'
    },
    bids: 15,
    timeLeft: '22h',
    category: 'Streaming Devices',
    retailer: 'Amazon Warehouse',
    unitsAvailable: 500,
    msrpDiscountPercent: 50,
    price: 12500,
    originalPrice: 20000,
    discount: 50,
    shipping: 'Free shipping',
    isRefurbished: false
  },
  {
    id: 'bargain3',
    title: 'Truckload of Target Home Goods, 18 Pallets, Customer Returns',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Target',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Target_Corporation_logo_%28vector%29.svg/1200px-Target_Corporation_logo_%28vector%29.svg.png'
    },
    bids: 2,
    timeLeft: '8h 45m',
    category: 'Home Goods',
    retailer: 'Target',
    unitsAvailable: 200,
    msrpDiscountPercent: 28,
    price: 3499,
    originalPrice: 5999,
    discount: 28,
    shipping: 'Free shipping',
    isRefurbished: false
  },
  {
    id: 'bargain4',
    title: 'Pallet of Amazon Electronics, Customer Returns, 120 Units',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 8,
    timeLeft: '4h 20m',
    category: 'Electronics',
    retailer: 'Amazon',
    unitsAvailable: 200,
    msrpDiscountPercent: 43,
    price: 1999,
    originalPrice: 3500,
    discount: 43,
    shipping: 'Free shipping',
    isRefurbished: false
  },
  {
    id: 'bargain5',
    title: 'Pallet of Wayfair Furniture, Customer Returns, 35 Units',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Wayfair',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Wayfair_logo.svg/1264px-Wayfair_logo.svg.png'
    },
    bids: 3,
    timeLeft: '1d 2h',
    category: 'Furniture',
    retailer: 'Wayfair',
    unitsAvailable: 200,
    msrpDiscountPercent: 55,
    price: 2499,
    originalPrice: 4000,
    discount: 55,
    shipping: 'Free shipping',
    isRefurbished: false
  },
  {
    id: 'bargain6',
    title: 'Truckload (24 Pallet Spaces) of Furniture, 84 Units, Ext. Retail $12,889',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Walmart',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/1200px-Walmart_logo.svg.png'
    },
    bids: 0,
    timeLeft: '9h 30m',
    category: 'Furniture',
    retailer: 'Walmart',
    unitsAvailable: 200,
    msrpDiscountPercent: 18,
    price: 3499,
    originalPrice: 5999,
    discount: 18,
    shipping: 'Free shipping',
    isRefurbished: false
  }
]

// Amazon Listings
export const amazonListings: Product[] = [
  {
    id: 'amazon1',
    title: 'Bulk Lot of 200 Amazon Echo Dot (4th Gen) Smart Speakers, Customer Returns',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 22,
    timeLeft: '3d 1h',
    category: 'Electronics Accessories',
    retailer: 'AmazonBasics Clearouts',
    unitsAvailable: 300,
    msrpDiscountPercent: 70,
    price: 499,
    originalPrice: 999,
    discount: 70,
    shipping: 'Free shipping',
    isRefurbished: false
  },
  {
    id: 'amazon2',
    title: 'Pallet of Amazon Fire TV Sticks, Tablets & Smart Home Devices, Grade B',
    image: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 5,
    timeLeft: '8h 30m',
    category: 'Electronics',
    price: 699,
    originalPrice: 1299,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'Amazon Returns',
    unitsAvailable: 150,
    msrpDiscountPercent: 46
  },
  {
    id: 'amazon3',
    title: 'Truckload of Amazon Warehouse Deals - Home Goods, Kitchen Appliances & More',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 2,
    timeLeft: '12h 45m',
    category: 'General Merchandise',
    price: 999,
    originalPrice: 1999,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'Amazon Warehouse',
    unitsAvailable: 800,
    msrpDiscountPercent: 50
  },
  {
    id: 'amazon4',
    title: 'Pallet of Amazon Kindle E-Readers, Mixed Models, Customer Returns',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 1,
    timeLeft: '5h 20m',
    category: 'Electronics',
    price: 299,
    originalPrice: 599,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'Amazon Returns',
    unitsAvailable: 120,
    msrpDiscountPercent: 50
  },
  {
    id: 'amazon5',
    title: 'Bulk Lot of Amazon Basics Office Supplies & Accessories, New Overstock',
    image: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 0,
    timeLeft: '1d 3h',
    category: 'Office Supplies',
    price: 199,
    originalPrice: 399,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'AmazonBasics Overstock',
    unitsAvailable: 400,
    msrpDiscountPercent: 50
  },
  {
    id: 'amazon6',
    title: 'Truckload of Amazon Returned Furniture, Home Decor & Outdoor Living',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    seller: {
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png'
    },
    bids: 4,
    timeLeft: '9h 15m',
    category: 'Furniture',
    price: 499,
    originalPrice: 999,
    shipping: 'Free shipping',
    isRefurbished: false,
    retailer: 'Amazon Returns',
    unitsAvailable: 700,
    msrpDiscountPercent: 50
  }
]


// Combined export for all products if needed later, or for a generic product source
export const allMockProducts: Product[] = [
  ...spotlightDeal,
  ...trendingDeals,
  ...featuredDeals,
  ...moreDeals,
  ...bargainListings,
  ...amazonListings,
  // ...recentlyViewed, // Assuming recentlyViewed is also Product[]
  // ...recommendedForYou, // Assuming recommendedForYou is also Product[]
];

// Ensure all individual product arrays have the category field for MarketplacePage filtering
const ensureCategories = (products: Product[]): Product[] => {
  return products.map(p => ({
    ...p,
    category: p.category || 'General Merchandise' // Default category if none exists
  }));
};
