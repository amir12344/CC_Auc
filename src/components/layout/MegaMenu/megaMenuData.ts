import { MegaMenuData } from './types';
import { featuredDeals, trendingDeals } from '@/src/mocks/productData';

export const megaMenuData: MegaMenuData = {
  categories: [
    {
      id: 'electronics',
      name: 'Electronics',
      href: '/collections/electronics',
      subcategories: [
        { id: 'smartphones', name: 'Smartphones', href: '/collections/smartphones' },
        { id: 'tablets', name: 'Tablets', href: '/collections/tablets' },
        { id: 'laptops', name: 'Laptops & Computers', href: '/collections/laptops' },
        { id: 'audio', name: 'Audio & Headphones', href: '/collections/audio' },
        { id: 'smart-home', name: 'Smart Home', href: '/collections/smart-home' },
        { id: 'gaming', name: 'Gaming', href: '/collections/gaming' },
        { id: 'cameras', name: 'Cameras', href: '/collections/cameras' },
        { id: 'accessories', name: 'Electronics Accessories', href: '/collections/electronics-accessories' }
      ],
      featured: featuredDeals.filter(product => 
        ['Electronics', 'Computers', 'Audio Gadgets', 'Mobile Electronics'].includes(product.category)
      ).slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    },
    {
      id: 'home-kitchen',
      name: 'Home & Kitchen',
      href: '/collections/home-kitchen',
      subcategories: [
        { id: 'kitchen-appliances', name: 'Kitchen Appliances', href: '/collections/kitchen-appliances' },
        { id: 'major-appliances', name: 'Major Appliances', href: '/collections/major-appliances' },
        { id: 'kitchen-tools', name: 'Kitchen Tools', href: '/collections/kitchen-tools' },
        { id: 'home-appliances', name: 'Home Appliances', href: '/collections/home-appliances' },
        { id: 'home-decor', name: 'Home Decor', href: '/collections/home-decor' },
        { id: 'bedding-bath', name: 'Bedding & Bath', href: '/collections/bedding-bath' },
        { id: 'storage', name: 'Storage & Organization', href: '/collections/storage' },
        { id: 'lighting', name: 'Lighting', href: '/collections/lighting' }
      ],
      featured: featuredDeals.filter(product => 
        ['Kitchen Tools', 'Major Appliances', 'Home Appliances'].includes(product.category)
      ).slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    },
    {
      id: 'fashion-beauty',
      name: 'Fashion & Beauty',
      href: '/collections/fashion-beauty',
      subcategories: [
        { id: 'footwear', name: 'Footwear', href: '/collections/footwear' },
        { id: 'accessories', name: 'Fashion Accessories', href: '/collections/accessories' },
        { id: 'watches', name: 'Watches', href: '/collections/watches' },
        { id: 'jewelry', name: 'Jewelry', href: '/collections/jewelry' },
        { id: 'skincare', name: 'Skincare', href: '/collections/skincare' },
        { id: 'cosmetics', name: 'Cosmetics', href: '/collections/cosmetics' },
        { id: 'fragrance', name: 'Fragrance', href: '/collections/fragrance' },
        { id: 'beauty-tools', name: 'Beauty Tools', href: '/collections/beauty-tools' }
      ],
      featured: [
        ...featuredDeals.filter(product => 
          ['Fashion Accessory', 'Performance Footwear', 'Outdoor Footwear'].includes(product.category)
        ),
        ...trendingDeals.filter(product => 
          ['Natural Skincare', 'Fragrance Beauty', 'Cosmetics Beauty'].includes(product.category)
        )
      ].slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    },
    {
      id: 'furniture',
      name: 'Furniture',
      href: '/collections/furniture',
      subcategories: [
        { id: 'living-room', name: 'Living Room', href: '/collections/living-room' },
        { id: 'bedroom', name: 'Bedroom', href: '/collections/bedroom' },
        { id: 'dining-room', name: 'Dining Room', href: '/collections/dining-room' },
        { id: 'office', name: 'Office Furniture', href: '/collections/office' },
        { id: 'outdoor-furniture', name: 'Outdoor Furniture', href: '/collections/outdoor-furniture' },
        { id: 'storage-furniture', name: 'Storage', href: '/collections/storage-furniture' },
        { id: 'kids-furniture', name: 'Kids Furniture', href: '/collections/kids-furniture' },
        { id: 'furniture-sets', name: 'Furniture Sets', href: '/collections/furniture-sets' }
      ],
      featured: featuredDeals.filter(product => 
        product.category === 'Furniture'
      ).slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    },
    {
      id: 'sports-outdoor',
      name: 'Sports & Outdoor',
      href: '/collections/sports-outdoor',
      subcategories: [
        { id: 'exercise-equipment', name: 'Exercise Equipment', href: '/collections/exercise-equipment' },
        { id: 'outdoor-gear', name: 'Outdoor Gear', href: '/collections/outdoor-gear' },
        { id: 'sports-equipment', name: 'Sports Equipment', href: '/collections/sports-equipment' },
        { id: 'athletic-wear', name: 'Athletic Wear', href: '/collections/athletic-wear' },
        { id: 'camping', name: 'Camping', href: '/collections/camping' },
        { id: 'cycling', name: 'Cycling', href: '/collections/cycling' },
        { id: 'water-sports', name: 'Water Sports', href: '/collections/water-sports' },
        { id: 'winter-sports', name: 'Winter Sports', href: '/collections/winter-sports' }
      ],
      featured: featuredDeals.filter(product => 
        ['Athletic Footwear', 'Performance Footwear', 'Outdoor Footwear'].includes(product.category)
      ).slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    },
    {
      id: 'flash-deals',
      name: 'Flash Deals',
      href: '/collections/flash-deals',
      subcategories: [
        { id: 'daily-deals', name: 'Daily Deals', href: '/collections/daily-deals' },
        { id: 'flash-auctions', name: 'Flash Auctions', href: '/collections/flash-auctions' },
        { id: 'clearance', name: 'Clearance', href: '/collections/clearance' },
        { id: 'overstock', name: 'Overstock', href: '/collections/overstock' },
        { id: 'returns', name: 'Customer Returns', href: '/collections/returns' },
        { id: 'bulk-lots', name: 'Bulk Lots', href: '/collections/bulk-lots' },
        { id: 'liquidation', name: 'Liquidation', href: '/collections/liquidation' },
        { id: 'warehouse-deals', name: 'Warehouse Deals', href: '/collections/warehouse-deals' }
      ],
      featured: [
        ...featuredDeals.filter(product => product.label === 'HOT'),
        ...trendingDeals.filter(product => product.isAlmostGone)
      ].slice(0, 3).map(product => ({
        id: product.id,
        title: product.title,
        href: `/marketplace/product/${product.id}`,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount
      }))
    }
  ]
}; 