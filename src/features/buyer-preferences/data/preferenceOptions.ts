import type { PreferenceStep } from "../types/preferences";

export const CATEGORY_OPTIONS = [
  { label: "Home", value: "HOME_KITCHEN_ORGANIZATION" },
  { label: "Apparel", value: "APPAREL" },
  { label: "Footwear", value: "FOOTWEAR" },
  { label: "Apparel Accessories", value: "APPAREL_ACCESSORIES" },
  { label: "Jewelry", value: "JEWELRY" },
  { label: "Beauty, Grooming & Wellness", value: "BEAUTY_GROOMING_WELLNESS" },
  { label: "Consumer Electronics", value: "CONSUMER_ELECTRONICS" },
  { label: "Mobile Accessories", value: "MOBILE_ACCESSORIES" },
  { label: "Toys, Games & Learning", value: "TOYS_GAMES_LEARNING" },
  { label: "Baby, Maternity & Kids", value: "BABY_MATERNITY_KIDS" },
  {
    label: "Tools, Automotive & Industrial",
    value: "TOOLS_AUTOMOTIVE_INDUSTRIAL",
  },
  { label: "Health, Household & Cleaning", value: "HEALTH_HOUSEHOLD_CLEANING" },
  { label: "Health Devices", value: "HEALTH_DEVICES" },
  { label: "Pets", value: "PETS" },
  { label: "Grocery, Snacks & Beverages", value: "GROCERY_SNACKS_BEVERAGES" },
  { label: "Office, School & Stationery", value: "OFFICE_SCHOOL_STATIONERY" },
  { label: "Travel", value: "BAGS_LUGGAGE_TRAVEL" },
  {
    label: "Outdoors, Garden & Sporting Goods",
    value: "OUTDOORS_GARDEN_SPORTING_GOODS",
  },
  { label: "Seasonal, Party & Gifts", value: "SEASONAL_PARTY_GIFTS" },
  { label: "Books, Media & Crafts", value: "BOOKS_MEDIA_CRAFTS" },
];

export const SUBCATEGORY_OPTIONS: Record<
  string,
  { label: string; value: string }[]
> = {
  HOME_KITCHEN_ORGANIZATION: [
    { label: "Small Appliances", value: "SMALL_APPLIANCES" },
    { label: "Cookware & Bakeware", value: "COOKWARE_BAKEWARE" },
    { label: "Serveware & Tabletop", value: "SERVEWARE_TABLETOP" },
    {
      label: "Kitchen Storage & Containers",
      value: "KITCHEN_STORAGE_CONTAINERS",
    },
    {
      label: "Trash Cans & Cleaning Caddies",
      value: "TRASH_CANS_CLEANING_CADDIES",
    },
    { label: "Bedding & Linens", value: "BEDDING_LINENS" },
    {
      label: "Bath Linens & Shower Curtains",
      value: "BATH_LINENS_SHOWER_CURTAINS",
    },
    { label: "Furniture", value: "FURNITURE" },
    { label: "Home Décor", value: "HOME_DECOR" },
    { label: "Wall Art & Frames", value: "WALL_ART_FRAMES" },
    {
      label: "Curtains & Window Treatments",
      value: "CURTAINS_WINDOW_TREATMENTS",
    },
    { label: "Rugs & Mats", value: "RUGS_MATS" },
    { label: "Clocks", value: "CLOCKS" },
    {
      label: "Laundry Hampers & Drying Racks",
      value: "LAUNDRY_HAMPERS_DRYING_RACKS",
    },
    {
      label: "Storage Bins & Closet Organizers",
      value: "STORAGE_BINS_CLOSET_ORGANIZERS",
    },
  ],
  APPAREL: [
    { label: "Men’s Clothing", value: "MENS_CLOTHING" },
    { label: "Women’s Clothing", value: "WOMENS_CLOTHING" },
    { label: "Kids & Baby Clothing", value: "KIDS_BABY_CLOTHING" },
    { label: "Seasonal Apparel", value: "SEASONAL_APPAREL" },
    { label: "Undergarments & Sleepwear", value: "UNDERGARMENTS_SLEEPWEAR" },
    { label: "Swimwear", value: "SWIMWEAR" },
    { label: "Workwear & Uniforms", value: "WORKWEAR_UNIFORMS" },
  ],
  FOOTWEAR: [
    { label: "Men’s Shoes", value: "MENS_SHOES" },
    { label: "Women’s Shoes", value: "WOMENS_SHOES" },
    { label: "Socks & Hosiery", value: "SOCKS_HOSIERY" },
    { label: "Footwear Accessories", value: "FOOTWEAR_ACCESSORIES" },
  ],
  APPAREL_ACCESSORIES: [
    { label: "Belts", value: "BELTS" },
    { label: "Hats & Beanies", value: "HATS_BEANIES" },
    { label: "Scarves", value: "SCARVES" },
    { label: "Gloves", value: "GLOVES" },
  ],
  JEWELRY: [
    { label: "Earrings", value: "EARRINGS" },
    { label: "Necklaces", value: "NECKLACES" },
    { label: "Rings", value: "RINGS" },
    { label: "Bracelets", value: "BRACELETS" },
  ],
  BEAUTY_GROOMING_WELLNESS: [
    { label: "Cosmetics", value: "COSMETICS" },
    { label: "Haircare", value: "HAIRCARE" },
    { label: "Skincare", value: "SKINCARE" },
    { label: "Fragrances", value: "FRAGRANCES" },
    { label: "Fragrance Sets & Samplers", value: "FRAGRANCE_SETS_SAMPLERS" },
    { label: "Grooming Tools", value: "GROOMING_TOOLS" },
    { label: "Men’s Grooming", value: "MENS_GROOMING" },
    { label: "Nail Care", value: "NAIL_CARE" },
    { label: "Oral Care", value: "ORAL_CARE" },
    {
      label: "Beauty Tools (Brushes, Mirrors, Tweezers)",
      value: "BEAUTY_TOOLS_BRUSHES_MIRRORS_TWEEZERS",
    },
    {
      label: "Temporary Tattoos / Body Art",
      value: "TEMPORARY_TATTOOS_BODY_ART",
    },
    {
      label: "Contact Lens Cases & Eye Drops",
      value: "CONTACT_LENS_CASES_EYE_DROPS",
    },
    { label: "Massage & Wellness Devices", value: "MASSAGE_WELLNESS_DEVICES" },
  ],
  CONSUMER_ELECTRONICS: [
    { label: "Phones & Tablets", value: "PHONES_TABLETS" },
    { label: "Laptops & Accessories", value: "LAPTOPS_ACCESSORIES" },
    { label: "Wearables & Smartwatches", value: "WEARABLES_SMARTWATCHES" },
    {
      label: "Audio (Headphones, Speakers)",
      value: "AUDIO_HEADPHONES_SPEAKERS",
    },
    { label: "Cameras & Drones", value: "CAMERAS_DRONES" },
    { label: "TVs & TV Accessories", value: "TVS_TV_ACCESSORIES" },
    {
      label: "Smart Home Devices (Thermostats, Plugs, Lighting)",
      value: "SMART_HOME_DEVICES_THERMOSTATS_PLUGS_LIGHTING",
    },
    { label: "eReaders & Tablets", value: "EREADERS_TABLETS" },
    { label: "Video Game Consoles", value: "VIDEO_GAME_CONSOLES" },
    { label: "Game Accessories", value: "GAME_ACCESSORIES" },
    { label: "DVDs & Blu-ray", value: "DVDS_BLU_RAY" },
    {
      label: "Surge Protectors & Power Strips",
      value: "SURGE_PROTECTORS_POWER_STRIPS",
    },
    { label: "Projectors & Accessories", value: "PROJECTORS_ACCESSORIES" },
    {
      label: "Dash Cams / Car Electronics",
      value: "DASH_CAMS_CAR_ELECTRONICS",
    },
  ],
  MOBILE_ACCESSORIES: [
    { label: "Phone Cases", value: "PHONE_CASES" },
    { label: "Screen Protectors", value: "SCREEN_PROTECTORS" },
    { label: "Charging Cables", value: "CHARGING_CABLES" },
    { label: "Power Banks", value: "POWER_BANKS" },
  ],
  TOYS_GAMES_LEARNING: [
    { label: "Preschool & Learning", value: "PRESCHOOL_LEARNING" },
    { label: "Action Figures & Dolls", value: "ACTION_FIGURES_DOLLS" },
    { label: "Outdoor Toys", value: "OUTDOOR_TOYS" },
    { label: "Board Games & Puzzles", value: "BOARD_GAMES_PUZZLES" },
    { label: "Building Sets (e.g., LEGO)", value: "BUILDING_SETS_LEGO" },
    { label: "RC Toys & Vehicles", value: "RC_TOYS_VEHICLES" },
    { label: "Playsets & Pretend Play", value: "PLAYSETS_PRETEND_PLAY" },
    { label: "STEM & Educational Kits", value: "STEM_EDUCATIONAL_KITS" },
    {
      label: "Flash Cards & Learning Games",
      value: "FLASH_CARDS_LEARNING_GAMES",
    },
    { label: "Fidget Toys & Sensory Kits", value: "FIDGET_TOYS_SENSORY_KITS" },
    { label: "Slime & Putty", value: "SLIME_PUTTY" },
    {
      label: "Trading Cards (e.g. Pokémon, Sports)",
      value: "TRADING_CARDS_POKEMON_SPORTS",
    },
  ],
  BABY_MATERNITY_KIDS: [
    { label: "Diapers & Wipes", value: "DIAPERS_WIPES" },
    { label: "Strollers & Car Seats", value: "STROLLERS_CAR_SEATS" },
    { label: "Feeding & Nursing", value: "FEEDING_NURSING" },
    { label: "Maternity Wear", value: "MATERNITY_WEAR" },
    { label: "Baby Apparel", value: "BABY_APPAREL" },
    { label: "Baby Toys", value: "BABY_TOYS" },
    { label: "Kids Books & Activity Sets", value: "KIDS_BOOKS_ACTIVITY_SETS" },
  ],
  TOOLS_AUTOMOTIVE_INDUSTRIAL: [
    { label: "Power Tools", value: "POWER_TOOLS" },
    { label: "Hand Tools", value: "HAND_TOOLS" },
    { label: "Car Accessories", value: "CAR_ACCESSORIES" },
    {
      label: "Car Care (Waxes, Wash, Air Fresheners)",
      value: "CAR_CARE_WAXES_WASH_AIR_FRESHENERS",
    },
    {
      label: "Tool Storage (Boxes, Bags, Benches)",
      value: "TOOL_STORAGE_BOXES_BAGS_BENCHES",
    },
    {
      label: "Measuring Tools (Levels, Tape)",
      value: "MEASURING_TOOLS_LEVELS_TAPE",
    },
    {
      label: "Lighting Tools (Work Lights, Headlamps)",
      value: "LIGHTING_TOOLS_WORK_LIGHTS_HEADLAMPS",
    },
    { label: "Garage & Storage", value: "GARAGE_STORAGE" },
    {
      label: "Safety & Security (Extinguishers, Flashlights, Alarms)",
      value: "SAFETY_SECURITY_EXTINGUISHERS_FLASHLIGHTS_ALARMS",
    },
    {
      label: "Replacement Parts (Belts, Filters, Fuses)",
      value: "REPLACEMENT_PARTS_BELTS_FILTERS_FUSES",
    },
    {
      label: "Paint Supplies (Rollers, Brushes, Tape)",
      value: "PAINT_SUPPLIES_ROLLERS_BRUSHES_TAPE",
    },
    {
      label: "Workwear Safety Gear (Gloves, Goggles, Vests)",
      value: "WORKWEAR_SAFETY_GEAR_GLOVES_GOGGLES_VESTS",
    },
  ],
  HEALTH_HOUSEHOLD_CLEANING: [
    { label: "OTC Medicine", value: "OTC_MEDICINE" },
    { label: "Vitamins & Supplements", value: "VITAMINS_SUPPLEMENTS" },
    { label: "Feminine Care", value: "FEMININE_CARE" },
    { label: "Adult Incontinence", value: "ADULT_INCONTINENCE" },
    {
      label: "Disposables (Masks, Gloves, Cotton Balls)",
      value: "DISPOSABLES_MASKS_GLOVES_COTTON_BALLS",
    },
    { label: "Cleaning Supplies", value: "CLEANING_SUPPLIES" },
    {
      label: "Cleaning Tools (Mops, Brushes, Sponges)",
      value: "CLEANING_TOOLS_MOPS_BRUSHES_SPONGES",
    },
    {
      label: "Paper Products (Tissues, Towels, TP)",
      value: "PAPER_PRODUCTS_TISSUES_TOWELS_TP",
    },
    {
      label: "Humidifiers & Air Purifiers",
      value: "HUMIDIFIERS_AIR_PURIFIERS",
    },
    {
      label: "Mobility Aids (Canes, Walkers)",
      value: "MOBILITY_AIDS_CANES_WALKERS",
    },
    { label: "Pill Organizers", value: "PILL_ORGANIZERS" },
    { label: "Toilet Safety & Bath Rails", value: "TOILET_SAFETY_BATH_RAILS" },
  ],
  HEALTH_DEVICES: [
    { label: "Thermometers", value: "THERMOMETERS" },
    { label: "Blood Pressure Monitors", value: "BLOOD_PRESSURE_MONITORS" },
    { label: "Oximeters", value: "OXIMETERS" },
    { label: "First Aid Kits", value: "FIRST_AID_KITS" },
  ],
  PETS: [
    { label: "Pet Food", value: "PET_FOOD" },
    { label: "Pet Toys & Accessories", value: "PET_TOYS_ACCESSORIES" },
    { label: "Pet Health Products", value: "PET_HEALTH_PRODUCTS" },
    { label: "Pet Beds & Crates", value: "PET_BEDS_CRATES" },
    {
      label: "Grooming Tools (Brushes, Clippers)",
      value: "GROOMING_TOOLS_BRUSHES_CLIPPERS",
    },
    {
      label: "Feeding Bowls & Water Dispensers",
      value: "FEEDING_BOWLS_WATER_DISPENSERS",
    },
    { label: "Litter Boxes & Waste Bags", value: "LITTER_BOXES_WASTE_BAGS" },
  ],
  GROCERY_SNACKS_BEVERAGES: [
    { label: "Shelf-Stable Foods", value: "SHELF_STABLE_FOODS" },
    { label: "Beverages", value: "BEVERAGES" },
    { label: "Snacks & Candy", value: "SNACKS_CANDY" },
    { label: "Gourmet Items", value: "GOURMET_ITEMS" },
    { label: "Pantry Packs", value: "PANTRY_PACKS" },
    { label: "Baby Food & Formula", value: "BABY_FOOD_FORMULA" },
    { label: "Condiments & Spices", value: "CONDIMENTS_SPICES" },
    { label: "Breakfast & Cereals", value: "BREAKFAST_CEREALS" },
  ],
  OFFICE_SCHOOL_STATIONERY: [
    { label: "Stationery & Supplies", value: "STATIONERY_SUPPLIES" },
    { label: "Desk Accessories", value: "DESK_ACCESSORIES" },
    { label: "Backpacks & Lunchboxes", value: "BACKPACKS_LUNCHBOXES" },
    { label: "Printers & Scanners", value: "PRINTERS_SCANNERS" },
    { label: "Ink & Toner", value: "INK_TONER" },
    { label: "Calculators", value: "CALCULATORS" },
    { label: "Office Phones", value: "OFFICE_PHONES" },
    { label: "Calendars & Planners", value: "CALENDARS_PLANNERS" },
    { label: "Whiteboards & Corkboards", value: "WHITEBOARDS_CORKBOARDS" },
    { label: "Labels & Label Makers", value: "LABELS_LABEL_MAKERS" },
    {
      label: "Binder Clips, Staplers & Tape Dispensers",
      value: "BINDER_CLIPS_STAPLERS_TAPE_DISPENSERS",
    },
  ],
  BAGS_LUGGAGE_TRAVEL: [
    { label: "Handbags & Wallets", value: "HANDBAGS_WALLETS" },
    { label: "Travel Luggage", value: "TRAVEL_LUGGAGE" },
    { label: "Duffel Bags", value: "DUFFEL_BAGS" },
    { label: "Backpacks", value: "BACKPACKS" },
    {
      label: "Fanny Packs & Crossbody Bags",
      value: "FANNY_PACKS_CROSSBODY_BAGS",
    },
    { label: "Laptop Bags & Tech Sleeves", value: "LAPTOP_BAGS_TECH_SLEEVES" },
    { label: "Toiletry Bags", value: "TOILETRY_BAGS" },
    { label: "Travel Kits & Organizers", value: "TRAVEL_KITS_ORGANIZERS" },
    { label: "Neck Pillows", value: "NECK_PILLOWS" },
    { label: "TSA Locks & Luggage Tags", value: "TSA_LOCKS_LUGGAGE_TAGS" },
    { label: "Reusables & Eco Goods", value: "REUSABLES_ECO_GOODS" },
  ],
  OUTDOORS_GARDEN_SPORTING_GOODS: [
    { label: "Camping & Hiking Gear", value: "CAMPING_HIKING_GEAR" },
    { label: "Fitness Equipment", value: "FITNESS_EQUIPMENT" },
    { label: "Bikes & Scooters", value: "BIKES_SCOOTERS" },
    { label: "Hunting & Fishing", value: "HUNTING_FISHING" },
    { label: "Garden Tools", value: "GARDEN_TOOLS" },
    { label: "Planters & Pots", value: "PLANTERS_POTS" },
    { label: "Outdoor Lighting", value: "OUTDOOR_LIGHTING" },
    { label: "Grill Accessories", value: "GRILL_ACCESSORIES" },
    { label: "Fire Pits", value: "FIRE_PITS" },
    { label: "Lawn Chairs", value: "LAWN_CHAIRS" },
    { label: "Pools & Floats", value: "POOLS_FLOATS" },
    { label: "Coolers", value: "COOLERS" },
    {
      label: "Insect Repellent & Citronella Candles",
      value: "INSECT_REPELLENT_CITRONELLA_CANDLES",
    },
    { label: "Outdoor Furniture Covers", value: "OUTDOOR_FURNITURE_COVERS" },
    { label: "Snow Shovels & Ice Melt", value: "SNOW_SHOVELS_ICE_MELT" },
  ],
  SEASONAL_PARTY_GIFTS: [
    { label: "Holiday Decor", value: "HOLIDAY_DECOR" },
    { label: "Gift Sets", value: "GIFT_SETS" },
    { label: "Seasonal Apparel", value: "SEASONAL_APPAREL" },
    { label: "Seasonal Kitchenware", value: "SEASONAL_KITCHENWARE" },
    { label: "Seasonal Lighting", value: "SEASONAL_LIGHTING" },
    {
      label: "Party Supplies & Decorations",
      value: "PARTY_SUPPLIES_DECORATIONS",
    },
    { label: "Costumes & Accessories", value: "COSTUMES_ACCESSORIES" },
    {
      label: "Wedding & Celebration Supplies (Favors, Guest Books)",
      value: "WEDDING_CELEBRATION_SUPPLIES_FAVORS_GUEST_BOOKS",
    },
  ],
  BOOKS_MEDIA_CRAFTS: [
    { label: "Children's Books", value: "CHILDRENS_BOOKS" },
    { label: "Cookbooks", value: "COOKBOOKS" },
    { label: "Puzzle & Activity Books", value: "PUZZLE_ACTIVITY_BOOKS" },
    { label: "Fiction & Non-Fiction", value: "FICTION_NON_FICTION" },
    { label: "Adult Coloring Books", value: "ADULT_COLORING_BOOKS" },
    {
      label: "Religious or Inspirational Books",
      value: "RELIGIOUS_INSPIRATIONAL_BOOKS",
    },
    { label: "Art Tools & DIY Kits", value: "ART_TOOLS_DIY_KITS" },
    { label: "Sewing & Fabric Tools", value: "SEWING_FABRIC_TOOLS" },
    { label: "Craft Supplies & Materials", value: "CRAFT_SUPPLIES_MATERIALS" },
    { label: "Embroidery & Notions", value: "EMBROIDERY_NOTIONS" },
  ],
};

// Discount options
export const DISCOUNT_OPTIONS = [
  { value: "no-preference", label: "No preference" },
  { value: "10-20", label: "10-20%" },
  { value: "20-30", label: "20-30%" },
  { value: "30-50", label: "30-50%" },
  { value: "50-70", label: "50-70%" },
  { value: "70-plus", label: "70%+" },
];

// Condition options
export const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "REFURBISHED", label: "Refurbished" },
  { value: "USED", label: "Used" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "SALVAGE", label: "Salvage" },
  { value: "CUSTOMER_RETURNS", label: "Customer Returns" },
  { value: "MIXED_CONDITION", label: "Mixed Condition" },
  { value: "SHELF_PULLS", label: "Shelf Pulls" },
  { value: "CLOSEOUTS", label: "Closeouts" },
  { value: "OVERSTOCK", label: "Overstock" },
  { value: "EXPIRED_SHORT_DATED", label: "Expired / Short-Dated" },
];

// Region options with state codes
export const REGION_OPTIONS = {
  Northeast: [
    { name: "Connecticut", code: "CT" },
    { name: "Maine", code: "ME" },
    { name: "Massachusetts", code: "MA" },
    { name: "New Hampshire", code: "NH" },
    { name: "Rhode Island", code: "RI" },
    { name: "Vermont", code: "VT" },
    { name: "New Jersey", code: "NJ" },
    { name: "New York", code: "NY" },
    { name: "Pennsylvania", code: "PA" },
  ],
  Midwest: [
    { name: "Illinois", code: "IL" },
    { name: "Indiana", code: "IN" },
    { name: "Michigan", code: "MI" },
    { name: "Ohio", code: "OH" },
    { name: "Wisconsin", code: "WI" },
    { name: "Iowa", code: "IA" },
    { name: "Kansas", code: "KS" },
    { name: "Minnesota", code: "MN" },
    { name: "Missouri", code: "MO" },
    { name: "Nebraska", code: "NE" },
    { name: "North Dakota", code: "ND" },
    { name: "South Dakota", code: "SD" },
  ],
  South: [
    { name: "Delaware", code: "DE" },
    { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" },
    { name: "Maryland", code: "MD" },
    { name: "North Carolina", code: "NC" },
    { name: "South Carolina", code: "SC" },
    { name: "Virginia", code: "VA" },
    { name: "Washington, D.C.", code: "DC" },
    { name: "West Virginia", code: "WV" },
    { name: "Alabama", code: "AL" },
    { name: "Kentucky", code: "KY" },
    { name: "Mississippi", code: "MS" },
    { name: "Tennessee", code: "TN" },
    { name: "Arkansas", code: "AR" },
    { name: "Louisiana", code: "LA" },
    { name: "Oklahoma", code: "OK" },
    { name: "Texas", code: "TX" },
  ],
  West: [
    { name: "Arizona", code: "AZ" },
    { name: "Colorado", code: "CO" },
    { name: "Idaho", code: "ID" },
    { name: "Montana", code: "MT" },
    { name: "Nevada", code: "NV" },
    { name: "New Mexico", code: "NM" },
    { name: "Utah", code: "UT" },
    { name: "Wyoming", code: "WY" },
    { name: "Alaska", code: "AK" },
    { name: "California", code: "CA" },
    { name: "Hawaii", code: "HI" },
    { name: "Oregon", code: "OR" },
    { name: "Washington", code: "WA" },
  ],
};

// Helper function to get state codes for selected regions
export const getStateCodesForRegions = (
  selectedRegions: string[]
): string[] => {
  const stateCodes: string[] = [];

  selectedRegions.forEach((region) => {
    if (REGION_OPTIONS[region as keyof typeof REGION_OPTIONS]) {
      const regionStates =
        REGION_OPTIONS[region as keyof typeof REGION_OPTIONS];
      stateCodes.push(...regionStates.map((state) => state.code));
    }
  });

  return stateCodes;
};

// Selling platform details
export const SELLING_PLATFORM_DETAILS = {
  discountRetail: {
    title: "Discount Retail",
    description: "Traditional discount retail stores and chains",
    examples: "TJ Maxx, Marshall's, Nordstrom Rack",
    key: "DISCOUNT_RETAIL",
  },
  stockX: {
    title: "StockX",
    description: "Sneakers, streetwear, and collectibles marketplace",
    examples: "Reselling authenticated products",
    key: "STOCKX",
  },
  amazonWalmart: {
    title: "Amazon or Walmart",
    description: "Major online marketplace platforms",
    examples: "FBA, Walmart Marketplace",
    key: "AMAZON_OR_WALMART",
  },
  liveMarketplaces: {
    title: "Live Seller Marketplaces",
    description: "Real-time selling platforms with live interaction",
    examples: "Whatnot, TikTok Shop, Facebook Live, Instagram Live",
    key: "LIVE_SELLER_MARKETPLACES",
  },
  resellerMarketplaces: {
    title: "Reseller Marketplaces",
    description: "Peer-to-peer reselling platforms",
    examples: "Poshmark, Depop, Mercari, Vinted, TheRealReal",
    key: "RESELLER_MARKETPLACES",
  },
  offPriceRetail: {
    title: "Off-Price Retail",
    description: "Retail stores specializing in discounted merchandise",
    examples: "Outlet stores, warehouse clubs",
    key: "OFF_PRICE_RETAIL",
  },
  export: {
    title: "Export",
    description: "International wholesale and export business",
    examples: "Bulk export to other countries",
    key: "EXPORTER",
  },
  refurbisher: {
    title: "Refurbisher / Repair Shop",
    description: "Repair and refurbish products for resale",
    examples: "Electronics repair, furniture restoration",
    key: "REFURBISHER_REPAIR_SHOP",
  },
};

// Step configuration - consolidated selling platforms into one step
export const PREFERENCE_STEPS: PreferenceStep[] = [
  {
    id: "where-you-sell",
    title: "Where do you sell?",
    description:
      "Select all the platforms and channels where you sell products",
    component: "WhereYouSellStep",
    isRequired: false,
  },
  {
    id: "regions",
    title: "Where do you source from? (Regions)",
    description: "Where do you source from? (Regions)",
    component: "RegionsStep",
    isRequired: false,
  },
  {
    id: "categories",
    title: "What categories do you buy?",
    description:
      "Choose the product categories and subcategories that interest you most",
    component: "CategoryStep",
    isRequired: false,
  },
  {
    id: "brands",
    title: "What brands do you prefer?",
    description: "Select the brands you're most interested in buying",
    component: "BrandsStep",
    isRequired: false,
  },
  {
    id: "conditions",
    title: "What product condition do you prefer?",
    description:
      "Select the product conditions you are interested in purchasing",
    component: "ConditionStep",
    isRequired: false,
  },
  {
    id: "budget",
    title: "What is your budget?",
    description: "Set your preferred price range per item",
    component: "BudgetStep",
    isRequired: false,
  },
  {
    id: "auction-catalog",
    title: "What type of listings do you want to see?",
    description: "Choose between auction or catalog listings",
    component: "AuctionCatalogStep",
    isRequired: false,
  },
];

// Default preferences
export const DEFAULT_PREFERENCES = {
  brands: [],
  categories: [],
  subcategories: [],
  minBudget: null,
  maxBudget: null,
  minimumDiscount: "no-preference",
  preferredTypes: [],
  conditions: [],
  sellingPlatforms: {
    discountRetail: false,
    stockX: false,
    amazonWalmart: false,
    liveMarketplaces: false,
    resellerMarketplaces: false,
    offPriceRetail: false,
    export: false,
    refurbisher: false,
  },
  preferredRegions: [],
  isCompleted: false,
  completedAt: null,
};
