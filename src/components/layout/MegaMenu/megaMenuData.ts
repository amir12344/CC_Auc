import type { MegaMenuData } from './types'

export const megaMenuData: MegaMenuData = {
  categories: [
    // Simple categories without dropdown
    {
      id: 'new',
      name: 'New',
      href: '/collections/new',
      subcategories: [],
      featured: [],
    },
    {
      id: 'featured',
      name: 'Featured',
      href: '/collections/featured',
      subcategories: [],
      featured: [],
    },
    {
      id: 'all-categories',
      name: 'All Categories',
      href: '/collections/all-categories',
      subcategories: [
        // Electronics
        {
          id: 'electronics',
          name: 'Electronics',
          href: '/collections/electronics',
        },
        {
          id: 'smartphones',
          name: 'Smartphones',
          href: '/collections/smartphones',
        },
        {
          id: 'tablets',
          name: 'Tablets',
          href: '/collections/tablets',
        },
        {
          id: 'laptops',
          name: 'Laptops & Computers',
          href: '/collections/laptops',
        },
        {
          id: 'tv-audio',
          name: 'TV & Audio',
          href: '/collections/tv-audio',
        },
        {
          id: 'gaming',
          name: 'Gaming',
          href: '/collections/gaming',
        },
        {
          id: 'smart-home',
          name: 'Smart Home',
          href: '/collections/smart-home',
        },

        // Fashion & Accessories
        {
          id: 'fashion-accessories',
          name: 'Fashion & Accessories',
          href: '/collections/fashion-accessories',
        },
        {
          id: 'handbags',
          name: 'Handbags',
          href: '/collections/handbags',
        },
        {
          id: 'jewelry',
          name: 'Jewelry',
          href: '/collections/jewelry',
        },
        {
          id: 'watches',
          name: 'Watches',
          href: '/collections/watches',
        },

        // Footwear
        {
          id: 'footwear',
          name: 'Footwear',
          href: '/collections/footwear',
        },
        {
          id: 'sneakers',
          name: 'Sneakers',
          href: '/collections/sneakers',
        },
        {
          id: 'boots',
          name: 'Boots',
          href: '/collections/boots',
        },
        {
          id: 'athletic-shoes',
          name: 'Athletic Shoes',
          href: '/collections/athletic-shoes',
        },

        // Beauty & Personal Care
        {
          id: 'beauty-personal-care',
          name: 'Beauty & Personal Care',
          href: '/collections/beauty-personal-care',
        },
        {
          id: 'skincare',
          name: 'Skincare',
          href: '/collections/skincare',
        },
        {
          id: 'makeup',
          name: 'Makeup',
          href: '/collections/makeup',
        },
        {
          id: 'haircare',
          name: 'Haircare',
          href: '/collections/haircare',
        },

        // Home & Garden
        {
          id: 'home-garden',
          name: 'Home & Garden',
          href: '/collections/home-garden',
        },
        {
          id: 'bedding-bath',
          name: 'Bedding & Bath',
          href: '/collections/bedding-bath',
        },
        {
          id: 'home-decor',
          name: 'Home Decor',
          href: '/collections/home-decor',
        },
        {
          id: 'housewares',
          name: 'Housewares',
          href: '/collections/housewares',
        },

        // Appliances
        {
          id: 'appliances',
          name: 'Appliances',
          href: '/collections/appliances',
        },
        {
          id: 'kitchen-appliances',
          name: 'Kitchen Appliances',
          href: '/collections/kitchen-appliances',
        },
        {
          id: 'major-appliances',
          name: 'Major Appliances',
          href: '/collections/major-appliances',
        },

        // Furniture
        {
          id: 'furniture',
          name: 'Furniture',
          href: '/collections/furniture',
        },
        {
          id: 'living-room',
          name: 'Living Room',
          href: '/collections/living-room',
        },
        {
          id: 'bedroom',
          name: 'Bedroom',
          href: '/collections/bedroom',
        },

        // Sports & Outdoor
        {
          id: 'sports-outdoor',
          name: 'Sports & Outdoor',
          href: '/collections/sports-outdoor',
        },
        {
          id: 'exercise-equipment',
          name: 'Exercise Equipment',
          href: '/collections/exercise-equipment',
        },

        // Other Categories
        {
          id: 'automotive',
          name: 'Automotive',
          href: '/collections/automotive',
        },
        {
          id: 'office-supplies',
          name: 'Office Supplies',
          href: '/collections/office-supplies',
        },
        {
          id: 'toys-games',
          name: 'Toys & Games',
          href: '/collections/toys-games',
        },
        {
          id: 'books-media',
          name: 'Books & Media',
          href: '/collections/books-media',
        },
      ],
      featured: [],
    },
    {
      id: 'live-auctions',
      name: 'Live Auctions',
      href: '/marketplace/auction',
      subcategories: [],
      featured: [],
    },
    {
      id: 'private-offers',
      name: 'Private Offers',
      href: '/buyer/deals/private-offers',
      subcategories: [],
      featured: [],
    },

    // Categories with dropdown
    {
      id: 'by-condition',
      name: 'By Condition',
      href: '/collections/condition',
      subcategories: [
        {
          id: 'new-condition',
          name: 'New',
          href: '/collections/condition/new',
        },
        {
          id: 'refurbished',
          name: 'Refurbished',
          href: '/collections/condition/refurbished',
        },
        {
          id: 'used',
          name: 'Used',
          href: '/collections/condition/used',
        },
        {
          id: 'damaged',
          name: 'Damaged',
          href: '/collections/condition/damaged',
        },
        {
          id: 'salvage',
          name: 'Salvage',
          href: '/collections/condition/salvage',
        },
        {
          id: 'customer-returns',
          name: 'Customer Returns',
          href: '/collections/condition/customer-returns',
        },
        {
          id: 'mixed-condition',
          name: 'Mixed Condition',
          href: '/collections/condition/mixed-condition',
        },
        {
          id: 'shelf-pulls',
          name: 'Shelf Pulls',
          href: '/collections/condition/shelf-pulls',
        },
        {
          id: 'closeouts',
          name: 'Closeouts',
          href: '/collections/condition/closeouts',
        },
        {
          id: 'overstock',
          name: 'Overstock',
          href: '/collections/condition/overstock',
        },
        {
          id: 'expired-short-dated',
          name: 'Expired / Short-Dated',
          href: '/collections/condition/expired-short-dated',
        },
      ],
      featured: [],
    },
    {
      id: 'shop-by-region',
      name: 'Shop By Region',
      href: '/collections/region',
      subcategories: [
        // United States
        {
          id: 'united-states',
          name: 'UNITED STATES',
          href: '/collections/region/united-states',
        },
        {
          id: 'northeast',
          name: 'Northeast',
          href: '/collections/region/northeast',
        },
        {
          id: 'midwest',
          name: 'Midwest',
          href: '/collections/region/midwest',
        },
        {
          id: 'south',
          name: 'South',
          href: '/collections/region/south',
        },
        {
          id: 'west',
          name: 'West',
          href: '/collections/region/west',
        },
        {
          id: 'shop-all-us',
          name: 'Shop All US',
          href: '/collections/region/shop-all-us',
        },

        // Canada
        {
          id: 'canada',
          name: 'CANADA',
          href: '/collections/region/canada',
        },
        {
          id: 'alberta',
          name: 'Alberta',
          href: '/collections/region/alberta',
        },
        {
          id: 'british-columbia',
          name: 'British Columbia',
          href: '/collections/region/british-columbia',
        },
        {
          id: 'quebec',
          name: 'Quebec',
          href: '/collections/region/quebec',
        },
        {
          id: 'ontario',
          name: 'Ontario',
          href: '/collections/region/ontario',
        },
        {
          id: 'shop-all-canada',
          name: 'Shop All Canada',
          href: '/collections/region/shop-all-canada',
        },

        // Europe
        {
          id: 'europe',
          name: 'EUROPE',
          href: '/collections/region/europe',
        },
        {
          id: 'france',
          name: 'France',
          href: '/collections/region/france',
        },
        {
          id: 'germany',
          name: 'Germany',
          href: '/collections/region/germany',
        },
        {
          id: 'poland',
          name: 'Poland',
          href: '/collections/region/poland',
        },
        {
          id: 'spain',
          name: 'Spain',
          href: '/collections/region/spain',
        },
        {
          id: 'united-kingdom',
          name: 'United Kingdom',
          href: '/collections/region/united-kingdom',
        },
        {
          id: 'shop-all-europe',
          name: 'Shop All Europe',
          href: '/collections/region/shop-all-europe',
        },

        // Asia
        {
          id: 'asia',
          name: 'ASIA',
          href: '/collections/region/asia',
        },
        {
          id: 'china',
          name: 'China',
          href: '/collections/region/china',
        },
        {
          id: 'india',
          name: 'India',
          href: '/collections/region/india',
        },
        {
          id: 'vietnam',
          name: 'Vietnam',
          href: '/collections/region/vietnam',
        },
        {
          id: 'indonesia',
          name: 'Indonesia',
          href: '/collections/region/indonesia',
        },
        {
          id: 'philippines',
          name: 'Philippines',
          href: '/collections/region/philippines',
        },
        {
          id: 'shop-all-asia',
          name: 'Shop All Asia',
          href: '/collections/region/shop-all-asia',
        },

        // Latin America
        {
          id: 'latin-america',
          name: 'LATIN AMERICA',
          href: '/collections/region/latin-america',
        },
        {
          id: 'mexico',
          name: 'Mexico',
          href: '/collections/region/mexico',
        },
        {
          id: 'brazil',
          name: 'Brazil',
          href: '/collections/region/brazil',
        },
        {
          id: 'colombia',
          name: 'Colombia',
          href: '/collections/region/colombia',
        },
        {
          id: 'chile',
          name: 'Chile',
          href: '/collections/region/chile',
        },
        {
          id: 'shop-all-latin-america',
          name: 'Shop All Latin America',
          href: '/collections/region/shop-all-latin-america',
        },

        // Australia & Oceania
        {
          id: 'australia-oceania',
          name: 'AUSTRALIA & OCEANIA',
          href: '/collections/region/australia-oceania',
        },
        {
          id: 'australia',
          name: 'Australia',
          href: '/collections/region/australia',
        },
        {
          id: 'new-zealand',
          name: 'New Zealand',
          href: '/collections/region/new-zealand',
        },
        {
          id: 'shop-all-oceania',
          name: 'Shop All Oceania',
          href: '/collections/region/shop-all-oceania',
        },

        // Middle East & Africa
        {
          id: 'middle-east-africa',
          name: 'MIDDLE EAST & AFRICA',
          href: '/collections/region/middle-east-africa',
        },
        {
          id: 'united-arab-emirates',
          name: 'United Arab Emirates',
          href: '/collections/region/united-arab-emirates',
        },
        {
          id: 'saudi-arabia',
          name: 'Saudi Arabia',
          href: '/collections/region/saudi-arabia',
        },
        {
          id: 'south-africa',
          name: 'South Africa',
          href: '/collections/region/south-africa',
        },
        {
          id: 'nigeria',
          name: 'Nigeria',
          href: '/collections/region/nigeria',
        },
        {
          id: 'shop-all-mea',
          name: 'Shop All MEA',
          href: '/collections/region/shop-all-mea',
        },
      ],
      featured: [],
    },
  ],
}
