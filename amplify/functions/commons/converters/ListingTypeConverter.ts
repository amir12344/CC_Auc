// Map Excel values to database enum values

import {
  freight_type,
  length_type,
  lot_condition_type,
  lot_packaging_type,
  packaging_type,
  product_category_type,
  product_condition_type,
  product_identifier_type,
  product_sub_category_type,
  shipping_type,
  variation_option_type,
  weight_type,
} from "../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { BiMap } from "../datatypes/BiMap";

export const fileToDbConditionBiMap = new BiMap<
  string,
  product_condition_type
>();
fileToDbConditionBiMap.set(
  "New - Retail & Ecommerce Ready",
  "NEW_RETAIL_ECOMMERCE_READY"
);
fileToDbConditionBiMap.set("New - Open Box", "NEW_OPEN_BOX");
fileToDbConditionBiMap.set("New - Damaged Box", "NEW_DAMAGED_BOX");
fileToDbConditionBiMap.set("New - Bulk Packaged", "NEW_BULK_PACKAGED");
fileToDbConditionBiMap.set(
  "Refurbished - Manufacturer Certified",
  "REFURBISHED_MANUFACTURER_CERTIFIED"
);
fileToDbConditionBiMap.set(
  "Refurbished - Seller Refurbished",
  "REFURBISHED_SELLER_REFURBISHED"
);
fileToDbConditionBiMap.set("Used - Like New", "USED_LIKE_NEW");
fileToDbConditionBiMap.set("Used - Good", "USED_GOOD");
fileToDbConditionBiMap.set("Used - Fair", "USED_FAIR");
fileToDbConditionBiMap.set("Used - As-Is", "USED_AS_IS");
fileToDbConditionBiMap.set("Damaged - Functional", "DAMAGED_FUNCTIONAL");
fileToDbConditionBiMap.set(
  "Damaged - Non-Functional",
  "DAMAGED_NON_FUNCTIONAL"
);
fileToDbConditionBiMap.set("Salvage - Parts Only", "SALVAGE_PARTS_ONLY");
fileToDbConditionBiMap.set("Cracked / Broken", "CRACKED_BROKEN");
fileToDbConditionBiMap.set("Uninspected Returns", "UNINSPECTED_RETURNS");
fileToDbConditionBiMap.set("Mixed Condition", "MIXED_CONDITION");
fileToDbConditionBiMap.set("Shelf Pulls", "SHELF_PULLS");
fileToDbConditionBiMap.set("Closeouts", "CLOSEOUTS");
fileToDbConditionBiMap.set("Overstock", "OVERSTOCK");
fileToDbConditionBiMap.set("Expired / Short-Dated", "EXPIRED_SHORT_DATED");

export const fileToDbPackagingBiMap = new BiMap<string, packaging_type>();
fileToDbPackagingBiMap.set(
  "Original Packaging - Sealed",
  "ORIGINAL_PACKAGING_SEALED"
);
fileToDbPackagingBiMap.set(
  "Original Packaging - Opened",
  "ORIGINAL_PACKAGING_OPENED"
);
fileToDbPackagingBiMap.set("No Retail Packaging", "NO_RETAIL_PACKAGING");
fileToDbPackagingBiMap.set("Damaged Packaging", "DAMAGED_PACKAGING");
fileToDbPackagingBiMap.set("Repackaged / Brown Box", "REPACKAGED_BROWN_BOX");

export const fileToDbLotPackagingBiMap = new BiMap<
  string,
  lot_packaging_type
>();
fileToDbLotPackagingBiMap.set("Pallets", "PALLETS");
fileToDbLotPackagingBiMap.set("Floor Loaded", "FLOOR_LOADED");

export const fileToDbShippingBiMap = new BiMap<string, shipping_type>();
fileToDbShippingBiMap.set("Flat_Rate", "FLAT_RATE");
fileToDbShippingBiMap.set("Calculated_Shipping", "CALCULATED_SHIPPING");
fileToDbShippingBiMap.set("Buyer_Arranged", "BUYER_ARRANGED");
fileToDbShippingBiMap.set("Free_Shipping", "FREE_SHIPPING");
fileToDbShippingBiMap.set("Local_Pickup_Only", "LOCAL_PICKUP_ONLY");
fileToDbShippingBiMap.set("Binding_Shipping", "BINDING_SHIPPING");
fileToDbShippingBiMap.set("Buyer_Pickup_Allowed", "BUYER_PICKUP_ALLOWED");

export const fileToDbFreightBiMap = new BiMap<string, freight_type>();
fileToDbFreightBiMap.set("SINGLE BOX", "SINGLE_BOX");
fileToDbFreightBiMap.set("MULTIPLE BOXES", "MULTIPLE_BOXES");
fileToDbFreightBiMap.set("LTL", "LTL");
fileToDbFreightBiMap.set("FTL", "FTL");

export const fileToDbLotConditionBiMap = new BiMap<
  string,
  lot_condition_type
>();
fileToDbLotConditionBiMap.set("New", "NEW");
fileToDbLotConditionBiMap.set("Like New", "LIKE_NEW");
fileToDbLotConditionBiMap.set("Refurbished", "REFURBISHED");
fileToDbLotConditionBiMap.set("Used", "USED");
fileToDbLotConditionBiMap.set("Scratch And Dent", "SCRATCH_AND_DENT");
fileToDbLotConditionBiMap.set("Damaged", "DAMAGED");
fileToDbLotConditionBiMap.set("Salvage", "SALVAGE");
fileToDbLotConditionBiMap.set("Mixed", "MIXED");
fileToDbLotConditionBiMap.set("Customer_Returns", "CUSTOMER_RETURNS");
fileToDbLotConditionBiMap.set("Shelf_Pulls", "SHELF_PULLS");
fileToDbLotConditionBiMap.set("Unknown", "UNKNOWN");
fileToDbLotConditionBiMap.set("Closeouts", "CLOSEOUTS");
fileToDbLotConditionBiMap.set("Overstock", "OVERSTOCK");

export const fileToDbVariationBiMap = new BiMap<
  string,
  variation_option_type
>();
fileToDbVariationBiMap.set("COLOR", "COLOR");
fileToDbVariationBiMap.set("SIZE", "SIZE");
fileToDbVariationBiMap.set("MATERIAL", "MATERIAL");
fileToDbVariationBiMap.set("STYLE", "STYLE");
fileToDbVariationBiMap.set("CAPACITY", "CAPACITY");
fileToDbVariationBiMap.set("FLAVOR", "FLAVOR");

export const fileToDbIdentifierBiMap = new BiMap<
  string,
  product_identifier_type
>();
fileToDbIdentifierBiMap.set("GTIN", "GTIN");
fileToDbIdentifierBiMap.set("UPC", "UPC");
fileToDbIdentifierBiMap.set("EAN", "EAN");
fileToDbIdentifierBiMap.set("ISBN", "ISBN");
fileToDbIdentifierBiMap.set("ISSN", "ISSN");

export const fileToDbCategoryBiMap = new BiMap<string, product_category_type>();
fileToDbCategoryBiMap.set(
  "Home, Kitchen & Organization",
  "HOME_KITCHEN_ORGANIZATION"
);
fileToDbCategoryBiMap.set("Apparel", "APPAREL");
fileToDbCategoryBiMap.set("Footwear", "FOOTWEAR");
fileToDbCategoryBiMap.set("Apparel Accessories", "APPAREL_ACCESSORIES");
fileToDbCategoryBiMap.set("Jewelry", "JEWELRY");
fileToDbCategoryBiMap.set(
  "Beauty, Grooming & Wellness",
  "BEAUTY_GROOMING_WELLNESS"
);
fileToDbCategoryBiMap.set("Consumer Electronics", "CONSUMER_ELECTRONICS");
fileToDbCategoryBiMap.set("Mobile Accessories", "MOBILE_ACCESSORIES");
fileToDbCategoryBiMap.set("Toys, Games & Learning", "TOYS_GAMES_LEARNING");
fileToDbCategoryBiMap.set("Baby, Maternity & Kids", "BABY_MATERNITY_KIDS");
fileToDbCategoryBiMap.set(
  "Tools, Automotive & Industrial",
  "TOOLS_AUTOMOTIVE_INDUSTRIAL"
);
fileToDbCategoryBiMap.set(
  "Health, Household & Cleaning",
  "HEALTH_HOUSEHOLD_CLEANING"
);
fileToDbCategoryBiMap.set("Health Devices", "HEALTH_DEVICES");
fileToDbCategoryBiMap.set("Pets", "PETS");
fileToDbCategoryBiMap.set(
  "Grocery, Snacks & Beverages",
  "GROCERY_SNACKS_BEVERAGES"
);
fileToDbCategoryBiMap.set(
  "Office, School & Stationery",
  "OFFICE_SCHOOL_STATIONERY"
);
fileToDbCategoryBiMap.set("Bags, Luggage & Travel", "BAGS_LUGGAGE_TRAVEL");
fileToDbCategoryBiMap.set(
  "Outdoors, Garden & Sporting Goods",
  "OUTDOORS_GARDEN_SPORTING_GOODS"
);
fileToDbCategoryBiMap.set("Seasonal, Party & Gifts", "SEASONAL_PARTY_GIFTS");
fileToDbCategoryBiMap.set("Books, Media & Crafts", "BOOKS_MEDIA_CRAFTS");

export const fileToDbSubcategoryBiMap = new BiMap<
  string,
  product_sub_category_type
>();
fileToDbSubcategoryBiMap.set("Small Appliances", "SMALL_APPLIANCES");
fileToDbSubcategoryBiMap.set("Cookware & Bakeware", "COOKWARE_BAKEWARE");
fileToDbSubcategoryBiMap.set("Serveware & Tabletop", "SERVEWARE_TABLETOP");
fileToDbSubcategoryBiMap.set(
  "Kitchen Storage & Containers",
  "KITCHEN_STORAGE_CONTAINERS"
);
fileToDbSubcategoryBiMap.set(
  "Trash Cans & Cleaning Caddies",
  "TRASH_CANS_CLEANING_CADDIES"
);
fileToDbSubcategoryBiMap.set("Bedding & Linens", "BEDDING_LINENS");
fileToDbSubcategoryBiMap.set(
  "Bath Linens & Shower Curtains",
  "BATH_LINENS_SHOWER_CURTAINS"
);
fileToDbSubcategoryBiMap.set("Furniture", "FURNITURE");
fileToDbSubcategoryBiMap.set("Home Décor", "HOME_DECOR");
fileToDbSubcategoryBiMap.set("Wall Art & Frames", "WALL_ART_FRAMES");
fileToDbSubcategoryBiMap.set(
  "Curtains & Window Treatments",
  "CURTAINS_WINDOW_TREATMENTS"
);
fileToDbSubcategoryBiMap.set("Rugs & Mats", "RUGS_MATS");
fileToDbSubcategoryBiMap.set("Clocks", "CLOCKS");
fileToDbSubcategoryBiMap.set(
  "Laundry Hampers & Drying Racks",
  "LAUNDRY_HAMPERS_DRYING_RACKS"
);
fileToDbSubcategoryBiMap.set(
  "Storage Bins & Closet Organizers",
  "STORAGE_BINS_CLOSET_ORGANIZERS"
);
fileToDbSubcategoryBiMap.set("Men's Clothing", "MENS_CLOTHING");
fileToDbSubcategoryBiMap.set("Women's Clothing", "WOMENS_CLOTHING");
fileToDbSubcategoryBiMap.set("Kids & Baby Clothing", "KIDS_BABY_CLOTHING");
fileToDbSubcategoryBiMap.set("Seasonal Apparel", "SEASONAL_APPAREL");
fileToDbSubcategoryBiMap.set(
  "Undergarments & Sleepwear",
  "UNDERGARMENTS_SLEEPWEAR"
);
fileToDbSubcategoryBiMap.set("Swimwear", "SWIMWEAR");
fileToDbSubcategoryBiMap.set("Workwear & Uniforms", "WORKWEAR_UNIFORMS");
fileToDbSubcategoryBiMap.set("Men's Shoes", "MENS_SHOES");
fileToDbSubcategoryBiMap.set("Women's Shoes", "WOMENS_SHOES");
fileToDbSubcategoryBiMap.set("Socks & Hosiery", "SOCKS_HOSIERY");
fileToDbSubcategoryBiMap.set("Footwear Accessories", "FOOTWEAR_ACCESSORIES");
fileToDbSubcategoryBiMap.set("Belts", "BELTS");
fileToDbSubcategoryBiMap.set("Hats & Beanies", "HATS_BEANIES");
fileToDbSubcategoryBiMap.set("Scarves", "SCARVES");
fileToDbSubcategoryBiMap.set("Gloves", "GLOVES");
fileToDbSubcategoryBiMap.set("Earrings", "EARRINGS");
fileToDbSubcategoryBiMap.set("Necklaces", "NECKLACES");
fileToDbSubcategoryBiMap.set("Rings", "RINGS");
fileToDbSubcategoryBiMap.set("Bracelets", "BRACELETS");
fileToDbSubcategoryBiMap.set("Cosmetics", "COSMETICS");
fileToDbSubcategoryBiMap.set("Haircare", "HAIRCARE");
fileToDbSubcategoryBiMap.set("Skincare", "SKINCARE");
fileToDbSubcategoryBiMap.set("Fragrances", "FRAGRANCES");
fileToDbSubcategoryBiMap.set(
  "Fragrance Sets & Samplers",
  "FRAGRANCE_SETS_SAMPLERS"
);
fileToDbSubcategoryBiMap.set("Grooming Tools", "GROOMING_TOOLS");
fileToDbSubcategoryBiMap.set("Men's Grooming", "MENS_GROOMING");
fileToDbSubcategoryBiMap.set("Nail Care", "NAIL_CARE");
fileToDbSubcategoryBiMap.set("Oral Care", "ORAL_CARE");
fileToDbSubcategoryBiMap.set(
  "Beauty Tools (Brushes, Mirrors, Tweezers)",
  "BEAUTY_TOOLS_BRUSHES_MIRRORS_TWEEZERS"
);
fileToDbSubcategoryBiMap.set(
  "Temporary Tattoos / Body Art",
  "TEMPORARY_TATTOOS_BODY_ART"
);
fileToDbSubcategoryBiMap.set(
  "Contact Lens Cases & Eye Drops",
  "CONTACT_LENS_CASES_EYE_DROPS"
);
fileToDbSubcategoryBiMap.set(
  "Massage & Wellness Devices",
  "MASSAGE_WELLNESS_DEVICES"
);
fileToDbSubcategoryBiMap.set("Phones & Tablets", "PHONES_TABLETS");
fileToDbSubcategoryBiMap.set("Laptops & Accessories", "LAPTOPS_ACCESSORIES");
fileToDbSubcategoryBiMap.set(
  "Wearables & Smartwatches",
  "WEARABLES_SMARTWATCHES"
);
fileToDbSubcategoryBiMap.set(
  "Audio (Headphones, Speakers)",
  "AUDIO_HEADPHONES_SPEAKERS"
);
fileToDbSubcategoryBiMap.set("Cameras & Drones", "CAMERAS_DRONES");
fileToDbSubcategoryBiMap.set("TVs & TV Accessories", "TVS_TV_ACCESSORIES");
fileToDbSubcategoryBiMap.set(
  "Smart Home Devices (Thermostats, Plugs, Lighting)",
  "SMART_HOME_DEVICES_THERMOSTATS_PLUGS_LIGHTING"
);
fileToDbSubcategoryBiMap.set("eReaders & Tablets", "EREADERS_TABLETS");
fileToDbSubcategoryBiMap.set("Video Game Consoles", "VIDEO_GAME_CONSOLES");
fileToDbSubcategoryBiMap.set("Game Accessories", "GAME_ACCESSORIES");
fileToDbSubcategoryBiMap.set("DVDs & Blu-ray", "DVDS_BLU_RAY");
fileToDbSubcategoryBiMap.set(
  "Surge Protectors & Power Strips",
  "SURGE_PROTECTORS_POWER_STRIPS"
);
fileToDbSubcategoryBiMap.set(
  "Projectors & Accessories",
  "PROJECTORS_ACCESSORIES"
);
fileToDbSubcategoryBiMap.set(
  "Dash Cams / Car Electronics",
  "DASH_CAMS_CAR_ELECTRONICS"
);
fileToDbSubcategoryBiMap.set("Phone Cases", "PHONE_CASES");
fileToDbSubcategoryBiMap.set("Screen Protectors", "SCREEN_PROTECTORS");
fileToDbSubcategoryBiMap.set("Charging Cables", "CHARGING_CABLES");
fileToDbSubcategoryBiMap.set("Power Banks", "POWER_BANKS");
fileToDbSubcategoryBiMap.set("Preschool & Learning", "PRESCHOOL_LEARNING");
fileToDbSubcategoryBiMap.set("Action Figures & Dolls", "ACTION_FIGURES_DOLLS");
fileToDbSubcategoryBiMap.set("Outdoor Toys", "OUTDOOR_TOYS");
fileToDbSubcategoryBiMap.set("Board Games & Puzzles", "BOARD_GAMES_PUZZLES");
fileToDbSubcategoryBiMap.set(
  "Building Sets (e.g., LEGO)",
  "BUILDING_SETS_LEGO"
);
fileToDbSubcategoryBiMap.set("RC Toys & Vehicles", "RC_TOYS_VEHICLES");
fileToDbSubcategoryBiMap.set(
  "Playsets & Pretend Play",
  "PLAYSETS_PRETEND_PLAY"
);
fileToDbSubcategoryBiMap.set(
  "STEM & Educational Kits",
  "STEM_EDUCATIONAL_KITS"
);
fileToDbSubcategoryBiMap.set(
  "Flash Cards & Learning Games",
  "FLASH_CARDS_LEARNING_GAMES"
);
fileToDbSubcategoryBiMap.set(
  "Fidget Toys & Sensory Kits",
  "FIDGET_TOYS_SENSORY_KITS"
);
fileToDbSubcategoryBiMap.set("Slime & Putty", "SLIME_PUTTY");
fileToDbSubcategoryBiMap.set(
  "Trading Cards (e.g. Pokémon, Sports)",
  "TRADING_CARDS_POKEMON_SPORTS"
);
fileToDbSubcategoryBiMap.set("Diapers & Wipes", "DIAPERS_WIPES");
fileToDbSubcategoryBiMap.set("Strollers & Car Seats", "STROLLERS_CAR_SEATS");
fileToDbSubcategoryBiMap.set("Feeding & Nursing", "FEEDING_NURSING");
fileToDbSubcategoryBiMap.set("Maternity Wear", "MATERNITY_WEAR");
fileToDbSubcategoryBiMap.set("Baby Apparel", "BABY_APPAREL");
fileToDbSubcategoryBiMap.set("Baby Toys", "BABY_TOYS");
fileToDbSubcategoryBiMap.set(
  "Kids Books & Activity Sets",
  "KIDS_BOOKS_ACTIVITY_SETS"
);
fileToDbSubcategoryBiMap.set("Power Tools", "POWER_TOOLS");
fileToDbSubcategoryBiMap.set("Hand Tools", "HAND_TOOLS");
fileToDbSubcategoryBiMap.set("Car Accessories", "CAR_ACCESSORIES");
fileToDbSubcategoryBiMap.set(
  "Car Care (Waxes, Wash, Air Fresheners)",
  "CAR_CARE_WAXES_WASH_AIR_FRESHENERS"
);
fileToDbSubcategoryBiMap.set(
  "Tool Storage (Boxes, Bags, Benches)",
  "TOOL_STORAGE_BOXES_BAGS_BENCHES"
);
fileToDbSubcategoryBiMap.set(
  "Measuring Tools (Levels, Tape)",
  "MEASURING_TOOLS_LEVELS_TAPE"
);
fileToDbSubcategoryBiMap.set(
  "Lighting Tools (Work Lights, Headlamps)",
  "LIGHTING_TOOLS_WORK_LIGHTS_HEADLAMPS"
);
fileToDbSubcategoryBiMap.set("Garage & Storage", "GARAGE_STORAGE");
fileToDbSubcategoryBiMap.set(
  "Safety & Security (Extinguishers, Flashlights, Alarms)",
  "SAFETY_SECURITY_EXTINGUISHERS_FLASHLIGHTS_ALARMS"
);
fileToDbSubcategoryBiMap.set(
  "Replacement Parts (Belts, Filters, Fuses)",
  "REPLACEMENT_PARTS_BELTS_FILTERS_FUSES"
);
fileToDbSubcategoryBiMap.set(
  "Paint Supplies (Rollers, Brushes, Tape)",
  "PAINT_SUPPLIES_ROLLERS_BRUSHES_TAPE"
);
fileToDbSubcategoryBiMap.set(
  "Workwear Safety Gear (Gloves, Goggles, Vests)",
  "WORKWEAR_SAFETY_GEAR_GLOVES_GOGGLES_VESTS"
);
fileToDbSubcategoryBiMap.set("OTC Medicine", "OTC_MEDICINE");
fileToDbSubcategoryBiMap.set("Vitamins & Supplements", "VITAMINS_SUPPLEMENTS");
fileToDbSubcategoryBiMap.set("Feminine Care", "FEMININE_CARE");
fileToDbSubcategoryBiMap.set("Adult Incontinence", "ADULT_INCONTINENCE");
fileToDbSubcategoryBiMap.set(
  "Disposables (Masks, Gloves, Cotton Balls)",
  "DISPOSABLES_MASKS_GLOVES_COTTON_BALLS"
);
fileToDbSubcategoryBiMap.set("Cleaning Supplies", "CLEANING_SUPPLIES");
fileToDbSubcategoryBiMap.set(
  "Cleaning Tools (Mops, Brushes, Sponges)",
  "CLEANING_TOOLS_MOPS_BRUSHES_SPONGES"
);
fileToDbSubcategoryBiMap.set(
  "Paper Products (Tissues, Towels, TP)",
  "PAPER_PRODUCTS_TISSUES_TOWELS_TP"
);
fileToDbSubcategoryBiMap.set(
  "Humidifiers & Air Purifiers",
  "HUMIDIFIERS_AIR_PURIFIERS"
);
fileToDbSubcategoryBiMap.set(
  "Mobility Aids (Canes, Walkers)",
  "MOBILITY_AIDS_CANES_WALKERS"
);
fileToDbSubcategoryBiMap.set("Pill Organizers", "PILL_ORGANIZERS");
fileToDbSubcategoryBiMap.set(
  "Toilet Safety & Bath Rails",
  "TOILET_SAFETY_BATH_RAILS"
);
fileToDbSubcategoryBiMap.set("Thermometers", "THERMOMETERS");
fileToDbSubcategoryBiMap.set(
  "Blood Pressure Monitors",
  "BLOOD_PRESSURE_MONITORS"
);
fileToDbSubcategoryBiMap.set("Oximeters", "OXIMETERS");
fileToDbSubcategoryBiMap.set("First Aid Kits", "FIRST_AID_KITS");
fileToDbSubcategoryBiMap.set("Pet Food", "PET_FOOD");
fileToDbSubcategoryBiMap.set("Pet Toys & Accessories", "PET_TOYS_ACCESSORIES");
fileToDbSubcategoryBiMap.set("Pet Health Products", "PET_HEALTH_PRODUCTS");
fileToDbSubcategoryBiMap.set("Pet Beds & Crates", "PET_BEDS_CRATES");
fileToDbSubcategoryBiMap.set(
  "Grooming Tools (Brushes, Clippers)",
  "GROOMING_TOOLS_BRUSHES_CLIPPERS"
);
fileToDbSubcategoryBiMap.set(
  "Feeding Bowls & Water Dispensers",
  "FEEDING_BOWLS_WATER_DISPENSERS"
);
fileToDbSubcategoryBiMap.set(
  "Litter Boxes & Waste Bags",
  "LITTER_BOXES_WASTE_BAGS"
);
fileToDbSubcategoryBiMap.set("Shelf-Stable Foods", "SHELF_STABLE_FOODS");
fileToDbSubcategoryBiMap.set("Beverages", "BEVERAGES");
fileToDbSubcategoryBiMap.set("Snacks & Candy", "SNACKS_CANDY");
fileToDbSubcategoryBiMap.set("Gourmet Items", "GOURMET_ITEMS");
fileToDbSubcategoryBiMap.set("Pantry Packs", "PANTRY_PACKS");
fileToDbSubcategoryBiMap.set("Baby Food & Formula", "BABY_FOOD_FORMULA");
fileToDbSubcategoryBiMap.set("Condiments & Spices", "CONDIMENTS_SPICES");
fileToDbSubcategoryBiMap.set("Breakfast & Cereals", "BREAKFAST_CEREALS");
fileToDbSubcategoryBiMap.set("Stationery & Supplies", "STATIONERY_SUPPLIES");
fileToDbSubcategoryBiMap.set("Desk Accessories", "DESK_ACCESSORIES");
fileToDbSubcategoryBiMap.set("Backpacks & Lunchboxes", "BACKPACKS_LUNCHBOXES");
fileToDbSubcategoryBiMap.set("Printers & Scanners", "PRINTERS_SCANNERS");
fileToDbSubcategoryBiMap.set("Ink & Toner", "INK_TONER");
fileToDbSubcategoryBiMap.set("Calculators", "CALCULATORS");
fileToDbSubcategoryBiMap.set("Office Phones", "OFFICE_PHONES");
fileToDbSubcategoryBiMap.set("Calendars & Planners", "CALENDARS_PLANNERS");
fileToDbSubcategoryBiMap.set(
  "Whiteboards & Corkboards",
  "WHITEBOARDS_CORKBOARDS"
);
fileToDbSubcategoryBiMap.set("Labels & Label Makers", "LABELS_LABEL_MAKERS");
fileToDbSubcategoryBiMap.set(
  "Binder Clips, Staplers & Tape Dispensers",
  "BINDER_CLIPS_STAPLERS_TAPE_DISPENSERS"
);
fileToDbSubcategoryBiMap.set("Handbags & Wallets", "HANDBAGS_WALLETS");
fileToDbSubcategoryBiMap.set("Travel Luggage", "TRAVEL_LUGGAGE");
fileToDbSubcategoryBiMap.set("Duffel Bags", "DUFFEL_BAGS");
fileToDbSubcategoryBiMap.set("Backpacks", "BACKPACKS");
fileToDbSubcategoryBiMap.set(
  "Fanny Packs & Crossbody Bags",
  "FANNY_PACKS_CROSSBODY_BAGS"
);
fileToDbSubcategoryBiMap.set(
  "Laptop Bags & Tech Sleeves",
  "LAPTOP_BAGS_TECH_SLEEVES"
);
fileToDbSubcategoryBiMap.set("Toiletry Bags", "TOILETRY_BAGS");
fileToDbSubcategoryBiMap.set(
  "Travel Kits & Organizers",
  "TRAVEL_KITS_ORGANIZERS"
);
fileToDbSubcategoryBiMap.set("Neck Pillows", "NECK_PILLOWS");
fileToDbSubcategoryBiMap.set(
  "TSA Locks & Luggage Tags",
  "TSA_LOCKS_LUGGAGE_TAGS"
);
fileToDbSubcategoryBiMap.set("Reusables & Eco Goods", "REUSABLES_ECO_GOODS");
fileToDbSubcategoryBiMap.set("Camping & Hiking Gear", "CAMPING_HIKING_GEAR");
fileToDbSubcategoryBiMap.set("Fitness Equipment", "FITNESS_EQUIPMENT");
fileToDbSubcategoryBiMap.set("Bikes & Scooters", "BIKES_SCOOTERS");
fileToDbSubcategoryBiMap.set("Hunting & Fishing", "HUNTING_FISHING");
fileToDbSubcategoryBiMap.set("Garden Tools", "GARDEN_TOOLS");
fileToDbSubcategoryBiMap.set("Planters & Pots", "PLANTERS_POTS");
fileToDbSubcategoryBiMap.set("Outdoor Lighting", "OUTDOOR_LIGHTING");
fileToDbSubcategoryBiMap.set("Grill Accessories", "GRILL_ACCESSORIES");
fileToDbSubcategoryBiMap.set("Fire Pits", "FIRE_PITS");
fileToDbSubcategoryBiMap.set("Lawn Chairs", "LAWN_CHAIRS");
fileToDbSubcategoryBiMap.set("Pools & Floats", "POOLS_FLOATS");
fileToDbSubcategoryBiMap.set("Coolers", "COOLERS");
fileToDbSubcategoryBiMap.set(
  "Insect Repellent & Citronella Candles",
  "INSECT_REPELLENT_CITRONELLA_CANDLES"
);
fileToDbSubcategoryBiMap.set(
  "Outdoor Furniture Covers",
  "OUTDOOR_FURNITURE_COVERS"
);
fileToDbSubcategoryBiMap.set(
  "Snow Shovels & Ice Melt",
  "SNOW_SHOVELS_ICE_MELT"
);
fileToDbSubcategoryBiMap.set("Holiday Decor", "HOLIDAY_DECOR");
fileToDbSubcategoryBiMap.set("Gift Sets", "GIFT_SETS");
fileToDbSubcategoryBiMap.set("Seasonal Kitchenware", "SEASONAL_KITCHENWARE");
fileToDbSubcategoryBiMap.set("Seasonal Lighting", "SEASONAL_LIGHTING");
fileToDbSubcategoryBiMap.set(
  "Party Supplies & Decorations",
  "PARTY_SUPPLIES_DECORATIONS"
);
fileToDbSubcategoryBiMap.set("Costumes & Accessories", "COSTUMES_ACCESSORIES");
fileToDbSubcategoryBiMap.set(
  "Wedding & Celebration Supplies (Favors, Guest Books)",
  "WEDDING_CELEBRATION_SUPPLIES_FAVORS_GUEST_BOOKS"
);
fileToDbSubcategoryBiMap.set("Children's Books", "CHILDRENS_BOOKS");
fileToDbSubcategoryBiMap.set("Cookbooks", "COOKBOOKS");
fileToDbSubcategoryBiMap.set(
  "Puzzle & Activity Books",
  "PUZZLE_ACTIVITY_BOOKS"
);
fileToDbSubcategoryBiMap.set("Fiction & Non-Fiction", "FICTION_NON_FICTION");
fileToDbSubcategoryBiMap.set("Adult Coloring Books", "ADULT_COLORING_BOOKS");
fileToDbSubcategoryBiMap.set(
  "Religious or Inspirational Books",
  "RELIGIOUS_INSPIRATIONAL_BOOKS"
);
fileToDbSubcategoryBiMap.set("Art Tools & DIY Kits", "ART_TOOLS_DIY_KITS");
fileToDbSubcategoryBiMap.set("Sewing & Fabric Tools", "SEWING_FABRIC_TOOLS");
fileToDbSubcategoryBiMap.set(
  "Craft Supplies & Materials",
  "CRAFT_SUPPLIES_MATERIALS"
);
fileToDbSubcategoryBiMap.set("Embroidery & Notions", "EMBROIDERY_NOTIONS");

export const fileToDbWeightUnitTypeBiMap = new BiMap<string, weight_type>();
fileToDbWeightUnitTypeBiMap.set("MICROGRAM", "MICROGRAM");
fileToDbWeightUnitTypeBiMap.set("MILLIGRAM", "MILLIGRAM");
fileToDbWeightUnitTypeBiMap.set("GRAM", "GRAM");
fileToDbWeightUnitTypeBiMap.set("KILOGRAM", "KILOGRAM");
fileToDbWeightUnitTypeBiMap.set("METRIC_TON", "METRIC_TON");
fileToDbWeightUnitTypeBiMap.set("IMPERIAL_TON", "IMPERIAL_TON");
fileToDbWeightUnitTypeBiMap.set("US_TON", "US_TON");
fileToDbWeightUnitTypeBiMap.set("OUNCE", "OUNCE");
fileToDbWeightUnitTypeBiMap.set("POUND", "POUND");
fileToDbWeightUnitTypeBiMap.set("STONE", "STONE");

export const fileToDbLengthUnitTypeBiMap = new BiMap<string, length_type>();
fileToDbLengthUnitTypeBiMap.set("MICROMETER", "MICROMETER");
fileToDbLengthUnitTypeBiMap.set("MILLIMETER", "MILLIMETER");
fileToDbLengthUnitTypeBiMap.set("CENTIMETER", "CENTIMETER");
fileToDbLengthUnitTypeBiMap.set("NANOMETER", "NANOMETER");
fileToDbLengthUnitTypeBiMap.set("METER", "METER");
fileToDbLengthUnitTypeBiMap.set("KILOMETER", "KILOMETER");
fileToDbLengthUnitTypeBiMap.set("MILE", "MILE");
fileToDbLengthUnitTypeBiMap.set("YARD", "YARD");
fileToDbLengthUnitTypeBiMap.set("FOOT", "FOOT");
fileToDbLengthUnitTypeBiMap.set("INCH", "INCH");
fileToDbLengthUnitTypeBiMap.set("NAUTICAL_MILE", "NAUTICAL_MILE");

export function mapCategory(category: string | undefined): string | null {
  if (!category) return null;

  // Map Excel categories to database enum values
  const categoryMap: { [key: string]: string } = {
    "Beauty, Grooming & Wellness": "BEAUTY_WELLNESS",
    Electronics: "ELECTRONICS",
    Clothing: "CLOTHING",
    "Home & Garden": "HOME_GARDEN",
    // Add more mappings as needed
  };

  return (
    categoryMap[category] || category.toUpperCase().replace(/[^A-Z0-9]/g, "_")
  );
}

export function mapSubcategory(subcategory: string | undefined): string | null {
  if (!subcategory) return null;

  const subcategoryMap: { [key: string]: string } = {
    Skincare: "SKINCARE",
    Cosmetics: "COSMETICS",
    Makeup: "MAKEUP",
    // Add more mappings as needed
  };

  return (
    subcategoryMap[subcategory] ||
    subcategory.toUpperCase().replace(/[^A-Z0-9]/g, "_")
  );
}

export function mapCondition(condition: string | undefined): string | null {
  if (!condition) return null;

  const conditionMap: { [key: string]: string } = {
    New: "NEW",
    "New - Retail & Ecommerce Ready": "NEW",
    Used: "USED",
    Refurbished: "REFURBISHED",
    Damaged: "DAMAGED",
  };

  return conditionMap[condition] || "NEW";
}

export function mapWeightType(weightType: string | undefined): string | null {
  if (!weightType) return null;

  const weightMap: { [key: string]: string } = {
    POUND: "LB",
    OUNCE: "OZ",
    KILOGRAM: "KG",
    GRAM: "G",
  };

  return weightMap[weightType] || weightType;
}
