// Constants for Lot Listings Upload Form

export const SOURCE_TYPES = [
  { label: "Retailer - Store Returns", value: "RETAILER_STORE_RETURNS" },
  {
    label: "Retailer - Dotcom/E-commerce Returns",
    value: "RETAILER_ECOMMERCE_RETURNS",
  },
  { label: "Retailer - Shelf Pulls", value: "RETAILER_SHELF_PULLS" },
  {
    label: "Retailer - Overstocks/Closeouts",
    value: "RETAILER_OVERSTOCKS_CLOSEOUTS",
  },
  {
    label: "3PL - Consolidated Returns",
    value: "THREE_PL_CONSOLIDATED_RETURNS",
  },
  {
    label: "3PL - Unclaimed/Abandoned Freight",
    value: "THREE_PL_UNCLAIMED_ABANDONED_FREIGHT",
  },
  {
    label: "Distributor - Overstocks/Closeouts",
    value: "DISTRIBUTOR_OVERSTOCKS_CLOSEOUTS",
  },
  {
    label: "Brand/Manufacturer - Returns/Refurb/Excess",
    value: "BRAND_MANUFACTURER_RETURNS_REFURB_EXCESS",
  },
  {
    label: "Marketplace - FBA/3P Returns",
    value: "MARKETPLACE_FBA_3P_RETURNS",
  },
] as const;

export const LOAD_TYPES = [
  { label: "Case Pack", value: "CASE_PACK" },
  { label: "Pallet", value: "PALLET" },
  { label: "Gaylord (Box on Pallet)", value: "GAYLORD" },
  { label: "Mixed Lot / Assorted Lot", value: "MIXED_LOT" },
  { label: "Less Than Truckload", value: "LESS_THAN_TRUCKLOAD" },
  { label: "Truckload (Full TL)", value: "FULL_TRUCKLOAD" },
  { label: "Multiple Truckloads / Program Load", value: "MULTIPLE_TRUCKLOADS" },
] as const;

export const LISTING_TYPES = [
  { label: "Manifested", value: "MANIFESTED" },
  { label: "Unmanifested", value: "UNMANIFESTED" },
  { label: "Partially Manifested", value: "PARTIALLY_MANIFESTED" },
] as const;

// Extract categories from the converter
export const CATEGORIES = [
  { label: "Home & Kitchen", value: "HOME_KITCHEN_ORGANIZATION" },
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
  { label: "Travel & Luggage", value: "BAGS_LUGGAGE_TRAVEL" },
  {
    label: "Outdoors, Garden & Sporting Goods",
    value: "OUTDOORS_GARDEN_SPORTING_GOODS",
  },
  { label: "Seasonal, Party & Gifts", value: "SEASONAL_PARTY_GIFTS" },
  { label: "Books, Media & Crafts", value: "BOOKS_MEDIA_CRAFTS" },
] as const;

// Extract subcategories from the converter (grouped by major categories for better UX)
export const SUBCATEGORIES = [
  // Home & Kitchen
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

  // Apparel & Accessories
  { label: "Men's Clothing", value: "MENS_CLOTHING" },
  { label: "Women's Clothing", value: "WOMENS_CLOTHING" },
  { label: "Kids & Baby Clothing", value: "KIDS_BABY_CLOTHING" },
  { label: "Seasonal Apparel", value: "SEASONAL_APPAREL" },
  { label: "Undergarments & Sleepwear", value: "UNDERGARMENTS_SLEEPWEAR" },
  { label: "Swimwear", value: "SWIMWEAR" },
  { label: "Workwear & Uniforms", value: "WORKWEAR_UNIFORMS" },

  // Footwear
  { label: "Men's Shoes", value: "MENS_SHOES" },
  { label: "Women's Shoes", value: "WOMENS_SHOES" },
  { label: "Socks & Hosiery", value: "SOCKS_HOSIERY" },
  { label: "Footwear Accessories", value: "FOOTWEAR_ACCESSORIES" },

  // Apparel Accessories & Jewelry
  { label: "Belts", value: "BELTS" },
  { label: "Hats & Beanies", value: "HATS_BEANIES" },
  { label: "Scarves", value: "SCARVES" },
  { label: "Gloves", value: "GLOVES" },
  { label: "Earrings", value: "EARRINGS" },
  { label: "Necklaces", value: "NECKLACES" },
  { label: "Rings", value: "RINGS" },
  { label: "Bracelets", value: "BRACELETS" },

  // Beauty, Grooming & Wellness
  { label: "Cosmetics", value: "COSMETICS" },
  { label: "Haircare", value: "HAIRCARE" },
  { label: "Skincare", value: "SKINCARE" },
  { label: "Fragrances", value: "FRAGRANCES" },
  { label: "Fragrance Sets & Samplers", value: "FRAGRANCE_SETS_SAMPLERS" },
  { label: "Grooming Tools", value: "GROOMING_TOOLS" },
  { label: "Men's Grooming", value: "MENS_GROOMING" },
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

  // Consumer Electronics & Mobile Accessories
  { label: "Phones & Tablets", value: "PHONES_TABLETS" },
  { label: "Laptops & Accessories", value: "LAPTOPS_ACCESSORIES" },
  { label: "Wearables & Smartwatches", value: "WEARABLES_SMARTWATCHES" },
  { label: "Audio (Headphones, Speakers)", value: "AUDIO_HEADPHONES_SPEAKERS" },
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
  { label: "Dash Cams / Car Electronics", value: "DASH_CAMS_CAR_ELECTRONICS" },
  { label: "Phone Cases", value: "PHONE_CASES" },
  { label: "Screen Protectors", value: "SCREEN_PROTECTORS" },
  { label: "Charging Cables", value: "CHARGING_CABLES" },
  { label: "Power Banks", value: "POWER_BANKS" },

  // Toys, Games & Learning
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

  // Baby, Maternity & Kids
  { label: "Diapers & Wipes", value: "DIAPERS_WIPES" },
  { label: "Strollers & Car Seats", value: "STROLLERS_CAR_SEATS" },
  { label: "Feeding & Nursing", value: "FEEDING_NURSING" },
  { label: "Maternity Wear", value: "MATERNITY_WEAR" },
  { label: "Baby Apparel", value: "BABY_APPAREL" },
  { label: "Baby Toys", value: "BABY_TOYS" },
  { label: "Kids Books & Activity Sets", value: "KIDS_BOOKS_ACTIVITY_SETS" },

  // Tools, Automotive & Industrial
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

  // Health, Household & Cleaning
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

  // Health Devices
  { label: "Humidifiers & Air Purifiers", value: "HUMIDIFIERS_AIR_PURIFIERS" },
  {
    label: "Mobility Aids (Canes, Walkers)",
    value: "MOBILITY_AIDS_CANES_WALKERS",
  },
  { label: "Pill Organizers", value: "PILL_ORGANIZERS" },
  { label: "Toilet Safety & Bath Rails", value: "TOILET_SAFETY_BATH_RAILS" },
  { label: "Thermometers", value: "THERMOMETERS" },
  { label: "Blood Pressure Monitors", value: "BLOOD_PRESSURE_MONITORS" },
  { label: "Oximeters", value: "OXIMETERS" },
  { label: "First Aid Kits", value: "FIRST_AID_KITS" },

  // Pets
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

  // Grocery, Snacks & Beverages
  { label: "Shelf-Stable Foods", value: "SHELF_STABLE_FOODS" },
  { label: "Beverages", value: "BEVERAGES" },
  { label: "Snacks & Candy", value: "SNACKS_CANDY" },
  { label: "Gourmet Items", value: "GOURMET_ITEMS" },
  { label: "Pantry Packs", value: "PANTRY_PACKS" },
  { label: "Baby Food & Formula", value: "BABY_FOOD_FORMULA" },
  { label: "Condiments & Spices", value: "CONDIMENTS_SPICES" },
  { label: "Breakfast & Cereals", value: "BREAKFAST_CEREALS" },

  // Office, School & Stationery
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

  // Travel & Luggage
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

  // Outdoors, Garden & Sporting Goods
  { label: "Reusables & Eco Goods", value: "REUSABLES_ECO_GOODS" },
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

  // Seasonal, Party & Gifts
  { label: "Holiday Decor", value: "HOLIDAY_DECOR" },
  { label: "Gift Sets", value: "GIFT_SETS" },
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

  // Books, Media & Crafts
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
] as const;

export const LOT_TYPES = [
  { label: "New", value: "NEW" },
  { label: "Like New", value: "LIKE_NEW" },
  { label: "Refurbished", value: "REFURBISHED" },
  { label: "Used", value: "USED" },
  { label: "Scratch & Dent", value: "SCRATCH_AND_DENT" },
  { label: "Damaged", value: "DAMAGED" },
  { label: "Salvage", value: "SALVAGE" },
  { label: "Mixed", value: "MIXED" },
  { label: "Customer Returns", value: "CUSTOMER_RETURNS" },
  { label: "Shelf Pulls", value: "SHELF_PULLS" },
  { label: "Unknown", value: "UNKNOWN" },
  { label: "Closeouts", value: "CLOSEOUTS" },
  { label: "Overstock", value: "OVERSTOCK" },
] as const;

export const PACKAGING_TYPES = [
  { label: "Original Packaging - Sealed", value: "ORIGINAL_PACKAGING_SEALED" },
  { label: "Original Packaging - Opened", value: "ORIGINAL_PACKAGING_OPENED" },
  { label: "No Retail Packaging", value: "NO_RETAIL_PACKAGING" },
  { label: "Damaged Packaging", value: "DAMAGED_PACKAGING" },
  { label: "Repackaged / Brown Box", value: "REPACKAGED_BROWN_BOX" },
] as const;

export const INSPECTION_STATUS = [
  { label: "Uninspected", value: "UNINSPECTED" },
  { label: "As Is", value: "AS_IS" },
  { label: "Visual Check Only", value: "VISUAL_CHECK_ONLY" },
  { label: "Tested", value: "TESTED" },
  { label: "Certified", value: "CERTIFIED" },
] as const;

export const SHIPPING_TYPES = [
  { label: "Flat Rate", value: "FLAT_RATE" },
  { label: "Calculated Shipping", value: "CALCULATED_SHIPPING" },
  { label: "Buyer Arranged", value: "BUYER_ARRANGED" },
  { label: "Free Shipping", value: "FREE_SHIPPING" },
  { label: "Local Pickup Only", value: "LOCAL_PICKUP_ONLY" },
  { label: "Binding Shipping", value: "BINDING_SHIPPING" },
  { label: "Buyer Pickup Allowed", value: "BUYER_PICKUP_ALLOWED" },
] as const;

export const FREIGHT_TYPES = [
  { label: "Single Box", value: "SINGLE_BOX" },
  { label: "Multiple Boxes", value: "MULTIPLE_BOXES" },
  { label: "LTL", value: "LTL" },
  { label: "FTL", value: "FTL" },
] as const;

export const WEIGHT_TYPES = [
  { label: "Microgram", value: "MICROGRAM" },
  { label: "Milligram", value: "MILLIGRAM" },
  { label: "Gram", value: "GRAM" },
  { label: "Kilogram", value: "KILOGRAM" },
  { label: "Metric Ton", value: "METRIC_TON" },
  { label: "Imperial Ton", value: "IMPERIAL_TON" },
  { label: "US Ton", value: "US_TON" },
  { label: "Ounce", value: "OUNCE" },
  { label: "Pound", value: "POUND" },
  { label: "Stone", value: "STONE" },
] as const;

export const LOT_PACKAGING_OPTIONS = [
  { label: "Pallets", value: "PALLETS" },
  { label: "Floor Loaded", value: "FLOOR_LOADED" },
] as const;

export const SOURCE_NAMES = [
  { label: "Amazon", value: "AMAZON" },
  { label: "Walmart", value: "WALMART" },
  { label: "Target", value: "TARGET" },
  { label: "Costco", value: "COSTCO" },
  { label: "Sam's Club", value: "SAMS_CLUB" },
  { label: "BJ's Wholesale", value: "BJS_WHOLESALE" },
  { label: "Best Buy", value: "BEST_BUY" },
  { label: "Home Depot", value: "HOME_DEPOT" },
  { label: "Lowe's", value: "LOWES" },
  { label: "Wayfair", value: "WAYFAIR" },
  { label: "Kohl's", value: "KOHLS" },
  { label: "Macy's", value: "MACYS" },
  { label: "Nordstrom", value: "NORDSTROM" },
  { label: "Nordstrom Rack", value: "NORDSTROM_RACK" },
  { label: "Dick's Sporting Goods", value: "DICKS_SPORTING_GOODS" },
  { label: "Tractor Supply", value: "TRACTOR_SUPPLY" },
  { label: "Dollar General", value: "DOLLAR_GENERAL" },
  { label: "Family Dollar", value: "FAMILY_DOLLAR" },
  { label: "Five Below", value: "FIVE_BELOW" },
  { label: "CVS", value: "CVS" },
  { label: "Walgreens", value: "WALGREENS" },
  { label: "Ulta", value: "ULTA" },
  { label: "Sephora", value: "SEPHORA" },
  { label: "Bed Bath & Beyond", value: "BED_BATH_BEYOND" },
  { label: "Overstock", value: "OVERSTOCK" },
  { label: "Office Depot", value: "OFFICE_DEPOT" },
  { label: "OfficeMax", value: "OFFICEMAX" },
  { label: "Staples", value: "STAPLES" },
  { label: "Ace Hardware", value: "ACE_HARDWARE" },
  { label: "Academy Sports", value: "ACADEMY_SPORTS" },
  { label: "Ashley Furniture", value: "ASHLEY_FURNITURE" },
  { label: "Other", value: "OTHER" },
] as const;
