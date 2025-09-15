import type { MegaMenuData } from "./types";

// Define regex patterns at the top level for better performance
const SPACES_REGEX = /\s+/g;
const NON_WORD_REGEX = /[^\w-]+/g;
const MULTIPLE_DASHES_REGEX = /--+/g;
const START_DASHES_REGEX = /^-+/;
const END_DASHES_REGEX = /-+$/;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(SPACES_REGEX, "-") // Replace spaces with -
    .replace(NON_WORD_REGEX, "") // Remove all non-word chars
    .replace(MULTIPLE_DASHES_REGEX, "-") // Replace multiple - with single -
    .replace(START_DASHES_REGEX, "") // Trim - from start of text
    .replace(END_DASHES_REGEX, ""); // Trim - from end of text
}

export const megaMenuData: MegaMenuData = {
  categories: [
    // Simple categories without dropdown
    {
      id: "new",
      name: "New",
      subcategories: [],
      featured: [],
    },
    {
      id: "featured",
      name: "Featured",
      href: "/collections/featured",
      subcategories: [],
      featured: [],
    },
    {
      id: "all-categories",
      name: "All Categories",
      href: "/collections/all-categories",
      groups: [
        {
          id: "home",
          name: "Home",
          href: "/collections/home",
          subcategories: [
            "Small Appliances",
            "Cookware & Bakeware",
            "Serveware & Tabletop",
            "Kitchen Storage & Containers",
            "Trash Cans & Cleaning Caddies",
            "Bedding & Linens",
            "Bath Linens & Shower Curtains",
            "Furniture",
            "Home Décor",
            "Wall Art & Frames",
            "Curtains & Window Treatments",
            "Rugs & Mats",
            "Clocks",
            "Laundry Hampers & Drying Racks",
            "Storage Bins & Closet Organizers",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "apparel",
          name: "Apparel",
          href: "/collections/apparel",
          subcategories: [
            "Men's Clothing",
            "Women's Clothing",
            "Kids & Baby Clothing",
            "Seasonal Apparel",
            "Undergarments & Sleepwear",
            "Swimwear",
            "Workwear & Uniforms",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "footwear",
          name: "Footwear",
          href: "/collections/footwear",
          subcategories: [
            "Men's Shoes",
            "Women's Shoes",
            "Socks & Hosiery",
            "Footwear Accessories",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "apparel-accessories",
          name: "Apparel Accessories",
          href: "/collections/apparel-accessories",
          subcategories: ["Belts", "Hats & Beanies", "Scarves", "Gloves"].map(
            (name) => ({
              id: slugify(name),
              name,
              href: `/collections/${slugify(name)}`,
            })
          ),
        },
        {
          id: "jewelry",
          name: "Jewelry",
          href: "/collections/jewelry",
          subcategories: ["Earrings", "Necklaces", "Rings", "Bracelets"].map(
            (name) => ({
              id: slugify(name),
              name,
              href: `/collections/${slugify(name)}`,
            })
          ),
        },
        {
          id: "beauty-grooming-wellness",
          name: "Beauty, Grooming & Wellness",
          href: "/collections/beauty-grooming-wellness",
          subcategories: [
            "Cosmetics",
            "Haircare",
            "Skincare",
            "Fragrances",
            "Fragrance Sets & Samplers",
            "Grooming Tools",
            "Men's Grooming",
            "Nail Care",
            "Oral Care",
            "Beauty Tools (Brushes, Mirrors, Tweezers)",
            "Temporary Tattoos / Body Art",
            "Contact Lens Cases & Eye Drops",
            "Massage & Wellness Devices",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "consumer-electronics",
          name: "Consumer Electronics",
          href: "/collections/consumer-electronics",
          subcategories: [
            "Phones & Tablets",
            "Laptops & Accessories",
            "Wearables & Smartwatches",
            "Audio (Headphones, Speakers)",
            "Cameras & Drones",
            "TVs & TV Accessories",
            "Smart Home Devices (Thermostats, Plugs, Lighting)",
            "eReaders & Tablets",
            "Video Game Consoles",
            "Game Accessories",
            "DVDs & Blu-ray",
            "Surge Protectors & Power Strips",
            "Projectors & Accessories",
            "Dash Cams / Car Electronics",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "mobile-accessories",
          name: "Mobile Accessories",
          href: "/collections/mobile-accessories",
          subcategories: [
            "Phone Cases",
            "Screen Protectors",
            "Charging Cables",
            "Power Banks",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "toys-games-learning",
          name: "Toys, Games & Learning",
          href: "/collections/toys-games-learning",
          subcategories: [
            "Preschool & Learning",
            "Action Figures & Dolls",
            "Outdoor Toys",
            "Board Games & Puzzles",
            "Building Sets (e.g., LEGO)",
            "RC Toys & Vehicles",
            "Playsets & Pretend Play",
            "STEM & Educational Kits",
            "Flash Cards & Learning Games",
            "Fidget Toys & Sensory Kits",
            "Slime & Putty",
            "Trading Cards (e.g. Pokémon, Sports)",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "baby-maternity-kids",
          name: "Baby, Maternity & Kids",
          href: "/collections/baby-maternity-kids",
          subcategories: [
            "Diapers & Wipes",
            "Strollers & Car Seats",
            "Feeding & Nursing",
            "Maternity Wear",
            "Baby Apparel",
            "Baby Toys",
            "Kids Books & Activity Sets",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "tools-automotive-industrial",
          name: "Tools, Automotive & Industrial",
          href: "/collections/tools-automotive-industrial",
          subcategories: [
            "Power Tools",
            "Hand Tools",
            "Car Accessories",
            "Car Care (Waxes, Wash, Air Fresheners)",
            "Tool Storage (Boxes, Bags, Benches)",
            "Measuring Tools (Levels, Tape)",
            "Lighting Tools (Work Lights, Headlamps)",
            "Garage & Storage",
            "Safety & Security (Extinguishers, Flashlights, Alarms)",
            "Replacement Parts (Belts, Filters, Fuses)",
            "Paint Supplies (Rollers, Brushes, Tape)",
            "Workwear Safety Gear (Gloves, Goggles, Vests)",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "health-household-cleaning",
          name: "Health, Household & Cleaning",
          href: "/collections/health-household-cleaning",
          subcategories: [
            "OTC Medicine",
            "Vitamins & Supplements",
            "Feminine Care",
            "Adult Incontinence",
            "Disposables (Masks, Gloves, Cotton Balls)",
            "Cleaning Supplies",
            "Cleaning Tools (Mops, Brushes, Sponges)",
            "Paper Products (Tissues, Towels, TP)",
            "Humidifiers & Air Purifiers",
            "Mobility Aids (Canes, Walkers)",
            "Pill Organizers",
            "Toilet Safety & Bath Rails",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "health-devices",
          name: "Health Devices",
          href: "/collections/health-devices",
          subcategories: [
            "Thermometers",
            "Blood Pressure Monitors",
            "Oximeters",
            "First Aid Kits",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "pets",
          name: "Pets",
          href: "/collections/pets",
          subcategories: [
            "Pet Food",
            "Pet Toys & Accessories",
            "Pet Health Products",
            "Pet Beds & Crates",
            "Grooming Tools (Brushes, Clippers)",
            "Feeding Bowls & Water Dispensers",
            "Litter Boxes & Waste Bags",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "grocery-snacks-beverages",
          name: "Grocery, Snacks & Beverages",
          href: "/collections/grocery-snacks-beverages",
          subcategories: [
            "Shelf-Stable Foods",
            "Beverages",
            "Snacks & Candy",
            "Gourmet Items",
            "Pantry Packs",
            "Baby Food & Formula",
            "Condiments & Spices",
            "Breakfast & Cereals",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "office-school-stationery",
          name: "Office, School & Stationery",
          href: "/collections/office-school-stationery",
          subcategories: [
            "Stationery & Supplies",
            "Desk Accessories",
            "Backpacks & Lunchboxes",
            "Printers & Scanners",
            "Ink & Toner",
            "Calculators",
            "Office Phones",
            "Calendars & Planners",
            "Whiteboards & Corkboards",
            "Labels & Label Makers",
            "Binder Clips, Staplers & Tape Dispensers",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "travel",
          name: "Travel",
          href: "/collections/travel",
          subcategories: [
            "Handbags & Wallets",
            "Travel Luggage",
            "Duffel Bags",
            "Backpacks",
            "Fanny Packs & Crossbody Bags",
            "Laptop Bags & Tech Sleeves",
            "Toiletry Bags",
            "Travel Kits & Organizers",
            "Neck Pillows",
            "TSA Locks & Luggage Tags",
            "Reusables & Eco Goods",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "outdoors-garden-sporting-goods",
          name: "Outdoors, Garden & Sporting Goods",
          href: "/collections/outdoors-garden-sporting-goods",
          subcategories: [
            "Camping & Hiking Gear",
            "Fitness Equipment",
            "Bikes & Scooters",
            "Hunting & Fishing",
            "Garden Tools",
            "Planters & Pots",
            "Outdoor Lighting",
            "Grill Accessories",
            "Fire Pits",
            "Lawn Chairs",
            "Pools & Floats",
            "Coolers",
            "Insect Repellent & Citronella Candles",
            "Outdoor Furniture Covers",
            "Snow Shovels & Ice Melt",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "seasonal-party-gifts",
          name: "Seasonal, Party & Gifts",
          href: "/collections/seasonal-party-gifts",
          subcategories: [
            "Holiday Decor",
            "Gift Sets",
            "Seasonal Apparel",
            "Seasonal Kitchenware",
            "Seasonal Lighting",
            "Party Supplies & Decorations",
            "Costumes & Accessories",
            "Wedding & Celebration Supplies (Favors, Guest Books)",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
        {
          id: "books-media-crafts",
          name: "Books, Media & Crafts",
          href: "/collections/books-media-crafts",
          subcategories: [
            "Children's Books",
            "Cookbooks",
            "Puzzle & Activity Books",
            "Fiction & Non-Fiction",
            "Adult Coloring Books",
            "Religious or Inspirational Books",
            "Art Tools & DIY Kits",
            "Sewing & Fabric Tools",
            "Craft Supplies & Materials",
            "Embroidery & Notions",
          ].map((name) => ({
            id: slugify(name),
            name,
            href: `/collections/${slugify(name)}`,
          })),
        },
      ],
      subcategories: [],
      featured: [],
    },
    {
      id: "live-auctions",
      name: "Live Auctions",
      subcategories: [],
      featured: [],
    },
    {
      id: "private-offers",
      name: "Private Offers",
      href: "/buyer/deals/private-offers",
      subcategories: [],
      featured: [],
    },

    // Categories with dropdown
    {
      id: "by-condition",
      name: "By Condition",
      subcategories: [
        {
          id: "new-condition",
          name: "New",
        },
        {
          id: "refurbished",
          name: "Refurbished",
        },
        {
          id: "used",
          name: "Used",
        },
        {
          id: "damaged",
          name: "Damaged",
        },
        {
          id: "salvage",
          name: "Salvage",
        },
        {
          id: "customer-returns",
          name: "Customer Returns",
        },
        {
          id: "mixed-condition",
          name: "Mixed Condition",
        },
        {
          id: "shelf-pulls",
          name: "Shelf Pulls",
        },
        {
          id: "closeouts",
          name: "Closeouts",
        },
        {
          id: "overstock",
          name: "Overstock",
        },
        {
          id: "expired-short-dated",
          name: "Expired / Short-Dated",
        },
      ],
      featured: [],
    },
    {
      id: "shop-by-region",
      name: "Shop By Region",
      href: "/collections/region",
      subcategories: [
        {
          id: "northeast",
          name: "Northeast",
          href: "/collections/region/northeast",
        },
        {
          id: "midwest",
          name: "Midwest",
          href: "/collections/region/midwest",
        },
        {
          id: "south",
          name: "South",
          href: "/collections/region/south",
        },
        {
          id: "west",
          name: "West",
          href: "/collections/region/west",
        },
      ],
      featured: [],
    },
  ],
};
