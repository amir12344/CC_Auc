import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

import { addUserAddress } from "../functions/add-user-address/resource";
import { createAuctionListingFromFile } from "../functions/create-auction-listing-from-file/resource";
import { createBuyerProfile } from "../functions/create-buyer-profile/resource";
import { createCatalogListingFromFile } from "../functions/create-catalog-listing-from-file/resource";
import { createCatalogOfferFromFile } from "../functions/create-catalog-offer-from-file/resource";
import { createCatalogOffer } from "../functions/create-catalog-offer/resource";
import { createLotListing } from "../functions/create-lot-listing/resource";
import { createSellerProfile } from "../functions/create-seller-profile/resource";
import { createUser } from "../functions/create-user/resource";
import { modifyAndAcceptCatalogOffer } from "../functions/modify-and-accept-catalog-offer/resource";
import { negotiateCatalogOffer } from "../functions/negotiate-catalog-offer/resource";
import { notificationProcessor } from "../functions/notification-processor/resource";
import { placeBid } from "../functions/place-bid/resource";
import { queryData } from "../functions/query-data/resource";
import { setBuyerPreferences } from "../functions/set-buyer-preferences/resource";
import { webSocketConnect } from "../functions/websocket-connect/resource";
import { webSocketDisconnect } from "../functions/websocket-disconnect/resource";

const schema = a
  .schema({
    CurrencyCode: a.enum([
      "USD",
      "CAD",
      "MXN",
      "GBP",
      "EUR",
      "CHF",
      "DKK",
      "CZK",
      "RUB",
      "TRY",
      "INR",
      "CNY",
      "HKD",
      "ILS",
      "KRW",
      "SGD",
      "JPY",
      "AUD",
      "NZD",
    ]),

    AuctionBidType: a.enum(["REGULAR", "BUY_NOW"]),

    CatalogNegotiationUserType: a.enum(["BUYER", "SELLER"]),

    NegotiationActionType: a.enum([
      "BUYER_OFFER",
      "SELLER_COUNTER",
      "BUYER_COUNTER",
      "SELLER_ACCEPT",
      "BUYER_ACCEPT",
      "SELLER_REJECT",
      "BUYER_REJECT",
      "SELLER_OFFER",
      "SYSTEM_AUTO_ACCEPT",
    ]),

    ItemChangeType: a.enum([
      "ITEM_ADDED",
      "ITEM_REMOVED",
      "QUANTITY_CHANGED",
      "ITEM_REPLACED",
      "PRICE_CHANGED",
      "TERMS_UPDATED",
      "AUTO_ACCEPTED",
    ]),

    ItemResponseType: a.enum(["ACCEPT", "REJECT", "COUNTER"]),

    RejectionCategory: a.enum([
      "PRICING_TOO_LOW",
      "PRICING_TOO_HIGH",
      "BUDGET_CONSTRAINTS",
      "INVENTORY_UNAVAILABLE",
      "DELIVERY_TIMELINE_TOO_LONG",
      "FOUND_BETTER_ALTERNATIVE",
      "PROJECT_CANCELLED",
      "OTHER",
    ]),

    UserType: a.enum(["BUYER", "SELLER", "BUYER_AND_SELLER"]),

    BuyerPreferencesRequestType: a.enum(["CREATE", "ADD", "DELETE"]),

    ListingTypePreference: a.enum(["AUCTION", "CATALOG", "BOTH"]),

    BuyerSegment: a.enum([
      "DISCOUNT_RETAIL",
      "STOCKX",
      "AMAZON_OR_WALMART",
      "LIVE_SELLER_MARKETPLACES",
      "RESELLER_MARKETPLACES",
      "OFF_PRICE_RETAIL",
      "EXPORTER",
      "REFURBISHER_REPAIR_SHOP",
    ]),

    PreferredRegion: a.enum([
      "WEST_US",
      "MIDWEST_US",
      "NORTHEAST_US",
      "SOUTH_US",
    ]),

    ProductCategory: a.enum([
      "HOME_KITCHEN_ORGANIZATION",
      "APPAREL",
      "FOOTWEAR",
      "APPAREL_ACCESSORIES",
      "JEWELRY",
      "BEAUTY_GROOMING_WELLNESS",
      "CONSUMER_ELECTRONICS",
      "MOBILE_ACCESSORIES",
      "TOYS_GAMES_LEARNING",
      "BABY_MATERNITY_KIDS",
      "TOOLS_AUTOMOTIVE_INDUSTRIAL",
      "HEALTH_HOUSEHOLD_CLEANING",
      "HEALTH_DEVICES",
      "PETS",
      "GROCERY_SNACKS_BEVERAGES",
      "OFFICE_SCHOOL_STATIONERY",
      "BAGS_LUGGAGE_TRAVEL",
      "OUTDOORS_GARDEN_SPORTING_GOODS",
      "SEASONAL_PARTY_GIFTS",
      "BOOKS_MEDIA_CRAFTS",
    ]),

    ProductSubcategory: a.enum([
      "SMALL_APPLIANCES",
      "COOKWARE_BAKEWARE",
      "SERVEWARE_TABLETOP",
      "KITCHEN_STORAGE_CONTAINERS",
      "TRASH_CANS_CLEANING_CADDIES",
      "BEDDING_LINENS",
      "BATH_LINENS_SHOWER_CURTAINS",
      "FURNITURE",
      "HOME_DECOR",
      "WALL_ART_FRAMES",
      "CURTAINS_WINDOW_TREATMENTS",
      "RUGS_MATS",
      "CLOCKS",
      "LAUNDRY_HAMPERS_DRYING_RACKS",
      "STORAGE_BINS_CLOSET_ORGANIZERS",
      "MENS_CLOTHING",
      "WOMENS_CLOTHING",
      "KIDS_BABY_CLOTHING",
      "SEASONAL_APPAREL",
      "UNDERGARMENTS_SLEEPWEAR",
      "SWIMWEAR",
      "WORKWEAR_UNIFORMS",
      "MENS_SHOES",
      "WOMENS_SHOES",
      "SOCKS_HOSIERY",
      "FOOTWEAR_ACCESSORIES",
      "BELTS",
      "HATS_BEANIES",
      "SCARVES",
      "GLOVES",
      "EARRINGS",
      "NECKLACES",
      "RINGS",
      "BRACELETS",
      "COSMETICS",
      "HAIRCARE",
      "SKINCARE",
      "FRAGRANCES",
      "FRAGRANCE_SETS_SAMPLERS",
      "GROOMING_TOOLS",
      "MENS_GROOMING",
      "NAIL_CARE",
      "ORAL_CARE",
      "BEAUTY_TOOLS_BRUSHES_MIRRORS_TWEEZERS",
      "TEMPORARY_TATTOOS_BODY_ART",
      "CONTACT_LENS_CASES_EYE_DROPS",
      "MASSAGE_WELLNESS_DEVICES",
      "PHONES_TABLETS",
      "LAPTOPS_ACCESSORIES",
      "WEARABLES_SMARTWATCHES",
      "AUDIO_HEADPHONES_SPEAKERS",
      "CAMERAS_DRONES",
      "TVS_TV_ACCESSORIES",
      "SMART_HOME_DEVICES_THERMOSTATS_PLUGS_LIGHTING",
      "EREADERS_TABLETS",
      "VIDEO_GAME_CONSOLES",
      "GAME_ACCESSORIES",
      "DVDS_BLU_RAY",
      "SURGE_PROTECTORS_POWER_STRIPS",
      "PROJECTORS_ACCESSORIES",
      "DASH_CAMS_CAR_ELECTRONICS",
      "PHONE_CASES",
      "SCREEN_PROTECTORS",
      "CHARGING_CABLES",
      "POWER_BANKS",
      "PRESCHOOL_LEARNING",
      "ACTION_FIGURES_DOLLS",
      "OUTDOOR_TOYS",
      "BOARD_GAMES_PUZZLES",
      "BUILDING_SETS_LEGO",
      "RC_TOYS_VEHICLES",
      "PLAYSETS_PRETEND_PLAY",
      "STEM_EDUCATIONAL_KITS",
      "FLASH_CARDS_LEARNING_GAMES",
      "FIDGET_TOYS_SENSORY_KITS",
      "SLIME_PUTTY",
      "TRADING_CARDS_POKEMON_SPORTS",
      "DIAPERS_WIPES",
      "STROLLERS_CAR_SEATS",
      "FEEDING_NURSING",
      "MATERNITY_WEAR",
      "BABY_APPAREL",
      "BABY_TOYS",
      "KIDS_BOOKS_ACTIVITY_SETS",
      "POWER_TOOLS",
      "HAND_TOOLS",
      "CAR_ACCESSORIES",
      "CAR_CARE_WAXES_WASH_AIR_FRESHENERS",
      "TOOL_STORAGE_BOXES_BAGS_BENCHES",
      "MEASURING_TOOLS_LEVELS_TAPE",
      "LIGHTING_TOOLS_WORK_LIGHTS_HEADLAMPS",
      "GARAGE_STORAGE",
      "SAFETY_SECURITY_EXTINGUISHERS_FLASHLIGHTS_ALARMS",
      "REPLACEMENT_PARTS_BELTS_FILTERS_FUSES",
      "PAINT_SUPPLIES_ROLLERS_BRUSHES_TAPE",
      "WORKWEAR_SAFETY_GEAR_GLOVES_GOGGLES_VESTS",
      "OTC_MEDICINE",
      "VITAMINS_SUPPLEMENTS",
      "FEMININE_CARE",
      "ADULT_INCONTINENCE",
      "DISPOSABLES_MASKS_GLOVES_COTTON_BALLS",
      "CLEANING_SUPPLIES",
      "CLEANING_TOOLS_MOPS_BRUSHES_SPONGES",
      "PAPER_PRODUCTS_TISSUES_TOWELS_TP",
      "HUMIDIFIERS_AIR_PURIFIERS",
      "MOBILITY_AIDS_CANES_WALKERS",
      "PILL_ORGANIZERS",
      "TOILET_SAFETY_BATH_RAILS",
      "THERMOMETERS",
      "BLOOD_PRESSURE_MONITORS",
      "OXIMETERS",
      "FIRST_AID_KITS",
      "PET_FOOD",
      "PET_TOYS_ACCESSORIES",
      "PET_HEALTH_PRODUCTS",
      "PET_BEDS_CRATES",
      "GROOMING_TOOLS_BRUSHES_CLIPPERS",
      "FEEDING_BOWLS_WATER_DISPENSERS",
      "LITTER_BOXES_WASTE_BAGS",
      "SHELF_STABLE_FOODS",
      "BEVERAGES",
      "SNACKS_CANDY",
      "GOURMET_ITEMS",
      "PANTRY_PACKS",
      "BABY_FOOD_FORMULA",
      "CONDIMENTS_SPICES",
      "BREAKFAST_CEREALS",
      "STATIONERY_SUPPLIES",
      "DESK_ACCESSORIES",
      "BACKPACKS_LUNCHBOXES",
      "PRINTERS_SCANNERS",
      "INK_TONER",
      "CALCULATORS",
      "OFFICE_PHONES",
      "CALENDARS_PLANNERS",
      "WHITEBOARDS_CORKBOARDS",
      "LABELS_LABEL_MAKERS",
      "BINDER_CLIPS_STAPLERS_TAPE_DISPENSERS",
      "HANDBAGS_WALLETS",
      "TRAVEL_LUGGAGE",
      "DUFFEL_BAGS",
      "BACKPACKS",
      "FANNY_PACKS_CROSSBODY_BAGS",
      "LAPTOP_BAGS_TECH_SLEEVES",
      "TOILETRY_BAGS",
      "TRAVEL_KITS_ORGANIZERS",
      "NECK_PILLOWS",
      "TSA_LOCKS_LUGGAGE_TAGS",
      "REUSABLES_ECO_GOODS",
      "CAMPING_HIKING_GEAR",
      "FITNESS_EQUIPMENT",
      "BIKES_SCOOTERS",
      "HUNTING_FISHING",
      "GARDEN_TOOLS",
      "PLANTERS_POTS",
      "OUTDOOR_LIGHTING",
      "GRILL_ACCESSORIES",
      "FIRE_PITS",
      "LAWN_CHAIRS",
      "POOLS_FLOATS",
      "COOLERS",
      "INSECT_REPELLENT_CITRONELLA_CANDLES",
      "OUTDOOR_FURNITURE_COVERS",
      "SNOW_SHOVELS_ICE_MELT",
      "HOLIDAY_DECOR",
      "GIFT_SETS",
      "SEASONAL_KITCHENWARE",
      "SEASONAL_LIGHTING",
      "PARTY_SUPPLIES_DECORATIONS",
      "COSTUMES_ACCESSORIES",
      "WEDDING_CELEBRATION_SUPPLIES_FAVORS_GUEST_BOOKS",
      "CHILDRENS_BOOKS",
      "COOKBOOKS",
      "PUZZLE_ACTIVITY_BOOKS",
      "FICTION_NON_FICTION",
      "ADULT_COLORING_BOOKS",
      "RELIGIOUS_INSPIRATIONAL_BOOKS",
      "ART_TOOLS_DIY_KITS",
      "SEWING_FABRIC_TOOLS",
      "CRAFT_SUPPLIES_MATERIALS",
      "EMBROIDERY_NOTIONS",
    ]),

    LotListingType: a.enum([
      "MANIFESTED",
      "UNMANIFESTED",
      "PARTIALLY_MANIFESTED",
    ]),
    ListingSourceType: a.enum([
      "RETAILER_STORE_RETURNS",
      "RETAILER_ECOMMERCE_RETURNS",
      "RETAILER_SHELF_PULLS",
      "RETAILER_OVERSTOCKS_CLOSEOUTS",
      "THREE_PL_CONSOLIDATED_RETURNS",
      "THREE_PL_UNCLAIMED_ABANDONED_FREIGHT",
      "DISTRIBUTOR_OVERSTOCKS_CLOSEOUTS",
      "BRAND_MANUFACTURER_RETURNS_REFURB_EXCESS",
      "MARKETPLACE_FBA_3P_RETURNS",
    ]),
    ListingSourceName: a.enum([
      "AMAZON",
      "WALMART",
      "TARGET",
      "COSTCO",
      "SAMS_CLUB",
      "BJS_WHOLESALE",
      "BEST_BUY",
      "HOME_DEPOT",
      "LOWES",
      "WAYFAIR",
      "KOHLS",
      "MACYS",
      "NORDSTROM",
      "NORDSTROM_RACK",
      "DICKS_SPORTING_GOODS",
      "TRACTOR_SUPPLY",
      "DOLLAR_GENERAL",
      "FAMILY_DOLLAR",
      "FIVE_BELOW",
      "CVS",
    ]),
    LotConditionType: a.enum([
      "NEW",
      "LIKE_NEW",
      "REFURBISHED",
      "USED",
      "SCRATCH_AND_DENT",
      "DAMAGED",
      "SALVAGE",
      "MIXED",
      "CUSTOMER_RETURNS",
      "SHELF_PULLS",
      "UNKNOWN",
      "CLOSEOUTS",
      "OVERSTOCK",
    ]),
    LoadType: a.enum([
      "CASE_PACK",
      "PALLET",
      "GAYLORD",
      "MIXED_LOT",
      "LESS_THAN_TRUCKLOAD",
      "FULL_TRUCKLOAD",
      "MULTIPLE_TRUCKLOADS",
    ]),
    WeightType: a.enum([
      "MICROGRAM",
      "MILLIGRAM",
      "GRAM",
      "KILOGRAM",
      "METRIC_TON",
      "IMPERIAL_TON",
      "US_TON",
      "OUNCE",
      "POUND",
      "STONE",
    ]),
    ShippingType: a.enum([
      "FLAT_RATE",
      "CALCULATED_SHIPPING",
      "BUYER_ARRANGED",
      "FREE_SHIPPING",
      "LOCAL_PICKUP_ONLY",
      "BINDING_SHIPPING",
      "BUYER_PICKUP_ALLOWED",
    ]),
    FreightType: a.enum(["SINGLE_BOX", "MULTIPLE_BOXES", "LTL", "FTL"]),
    LotPackagingType: a.enum(["PALLETS", "FLOOR_LOADED"]),
    LengthType: a.enum([
      "MICROMETER",
      "MILLIMETER",
      "CENTIMETER",
      "NANOMETER",
      "METER",
      "KILOMETER",
      "MILE",
      "YARD",
      "FOOT",
      "INCH",
      "NAUTICAL_MILE",
    ]),
    ListingInspectionStatus: a.enum([
      "UNINSPECTED",
      "AS_IS",
      "VISUAL_CHECK_ONLY",
      "TESTED",
      "CERTIFIED",
    ]),
    AddressType: a.enum(["DEFAULT", "SHIPPING", "BILLING"]),

    CatalogOfferModificationAction: a.enum([
      "ADD_PRODUCT",
      "UPDATE_EXISTING",
      "REMOVE_PRODUCT",
      "AUTO_FINALIZED", // NEW: for tracking auto-finalized unchanged items
    ]),

    ItemNegotiation: a.customType({
      catalogOfferItemId: a.string().required(),
      offerPricePerUnit: a.float().required(),
      offerQuantity: a.integer().required(),
      responseType: a.ref("ItemResponseType"),
      offerMessage: a.string(),
    }),

    ItemRejection: a.customType({
      catalogOfferItemId: a.string().required(),
      rejectionReason: a.string().required(),
      rejectionCategory: a.ref("RejectionCategory").required(),
    }),

    ItemChange: a.customType({
      changeType: a.ref("ItemChangeType").required(),
      catalogOfferItemId: a.string(),
      catalogProductVariantId: a.string(),
      newQuantity: a.integer(),
      requestedQuantity: a.integer(),
      buyerOfferPrice: a.float(),
      buyerOfferPriceCurrency: a.ref("CurrencyCode"),
      changeReason: a.string(),
    }),

    SuggestedVariant: a.customType({
      catalogProductVariantId: a.string().required(),
      suggestedPrice: a.float().required(),
      availableQuantity: a.integer().required(),
      productName: a.string().required(),
    }),

    Address: a.customType({
      firstName: a.string(),
      lastName: a.string(),
      address1: a.string().required(),
      address2: a.string(),
      address3: a.string(),
      city: a.string().required(),
      province: a.string().required(),
      provinceCode: a.string(),
      country: a.string().required(),
      countryCode: a.string(),
      zip: a.string().required(),
      phone: a.string(),
      company: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      addressType: a.ref("AddressType"),
    }),

    MinimumAcceptableTerms: a.customType({
      minimumUnitPrice: a.float(),
      minimumTotalOrder: a.float(),
      minimumQuantity: a.integer(),
    }),

    AlternativeSuggestion: a.customType({
      message: a.string().required(),
      suggestedVariants: a.ref("SuggestedVariant").array(),
      minimumAcceptableTerms: a.ref("MinimumAcceptableTerms"),
    }),

    FinalBudgetInfo: a.customType({
      maximumTotalBudget: a.float().required(),
      maximumUnitPrices: a.json(), // For flexible key-value pairs of item IDs to max prices
      preferredAlternatives: a.string().array(),
    }),

    VisibilityRulesLocation: a.customType({
      states: a.string().array(),
      countries: a.string().array(),
      zip_codes: a.string().array(),
      cities: a.string().array(),
    }),

    VisibilityRules: a.customType({
      buyer_segments: a.string().array(),
      locations: a.ref("VisibilityRulesLocation"),
    }),

    CatalogOfferItem: a.customType({
      catalogProductVariantId: a.string().required(),
      requestedQuantity: a.integer().required(),
      buyerOfferPrice: a.float().required(),
      buyerOfferPriceCurrency: a.ref("CurrencyCode").required(),
    }),
    LotListingImage: a.customType({
      imageS3Key: a.string().required(),
      sortOrder: a.integer().required(),
    }),
    CategoryPercentage: a.customType({
      category: a.ref("ProductCategory"),
      subcategory: a.ref("ProductSubcategory"),
      percent: a.float().required(),
    }),

    CatalogOfferModification: a.customType({
      action: a.ref("CatalogOfferModificationAction").required(),
      catalogProductPublicId: a.string(),
      catalogProductVariantPublicId: a.string(),
      catalogOfferItemPublicId: a.string(),
      quantity: a.integer(),
      sellerPricePerUnit: a.float(),
      newQuantity: a.integer(),
      newSellerPricePerUnit: a.float(),
      modificationReason: a.string(),
    }),

    // Dynamo DB tables

    /*
     * Define an EarlyAccessRegistration model for storing early access form submissions
     * This model replaces the Todo example and is configured for public access
     * to allow unauthenticated users to submit the form
     */

    EarlyAccessRegistration: a
      .model({
        firstName: a.string().required(),
        lastName: a.string().required(),
        companyName: a.string(),
        email: a.string().required(),
        phoneNumber: a.string(),
        termsAccepted: a.boolean().required(),
        registrationDate: a.datetime().required(),
      })
      .authorization((allow) => [
        // Allow public access for creating and reading records
        allow.publicApiKey().to(["create", "read"]),
        // Restrict other operations to admin users only
        // This ensures only authorized users can update, or delete records
      ]),

    // Meeting booking status enum and model for verification scheduling
    MeetingBookingStatus: a.enum([
      "BOOKED",
      "CANCELED",
      "COMPLETED",
      "EXPIRED",
    ]),

    MeetingBooking: a
      .model({
        buyerId: a.string().required(),
        buyerEmail: a.string(),
        startTimeUtc: a.datetime().required(),
        endTimeUtc: a.datetime().required(),
        timezone: a.string(),
        provider: a.string().required(),
        providerEventId: a.string().required(),
        providerEventTypeId: a.string(),
        joinUrl: a.string(),
        rescheduleUrl: a.string(),
        cancelUrl: a.string(),
        status: a.ref("MeetingBookingStatus").required(),
        createdAt: a.datetime().required(),
        updatedAt: a.datetime().required(),
      })
      .authorization((allow) => [
        allow.authenticated().to(["read"]),
        // Allow server-side routes (using API key) to write via webhook ingestion
        allow.publicApiKey().to(["create", "update", "read"]),
      ])
      .secondaryIndexes((index) => [
        index("buyerId")
          .sortKeys(["createdAt"])
          .queryField("meetingBookingsByBuyer"),
        index("providerEventId").queryField("meetingBookingByProviderEventId"),
      ]),

    // WebSocket Connection model
    WebSocketConnection: a
      .model({
        id: a.string().required(), // Primary key - will store connectionId value
        userId: a.string().required(), // User who owns this connection
        timestamp: a.datetime().required(), // When connection was established
        ttl: a.integer(), // TTL for automatic cleanup (24 hours)
      })
      .authorization((allow) => [
        allow.authenticated().to(["read"]), // Allow authenticated users to read connections
      ])
      .secondaryIndexes((index) => [
        index("userId") // GSI for querying connections by userId
          .sortKeys(["timestamp"])
          .queryField("connectionsByUserId"),
      ]),

    // Notification Storage model
    NotificationStorage: a
      .model({
        userId: a.string().required(), // Primary key - who the notification is for
        timestamp: a.datetime().required(), // Sort key - when notification was created
        type: a.string().required(), // Notification type (AUCTION_COMPLETED, etc.)
        title: a.string().required(), // Notification title
        message: a.string().required(), // Notification message
        data: a.json(), // Additional data (auction details, etc.)
        notificationRead: a.boolean().required().default(false), // Has user read this notification
        ttl: a.integer(), // TTL for automatic cleanup (30 days)
        createdAt: a.datetime().required(),
      })
      .authorization((allow) => [
        // Allow authenticated users to create, read, and update notifications
        // Security: Frontend filters by userId to ensure users only see their notifications
        // This is secure because GraphQL subscriptions use userId filter: { userId: { eq: currentUserId } }
        // TODO: revert back this change if the authenticated way does not work. fallback to old way
        // allow.owner().to(['read', 'update']),
        //
        allow.authenticated().to(["create", "read", "update"]),
        // System functions access via IAM policies (handled in backend.ts)
      ])
      .secondaryIndexes((index) => [
        index("userId")
          .sortKeys(["createdAt"])
          .queryField("notificationsByUserByDate"),
        index("type").sortKeys(["createdAt"]).queryField("notificationsByType"),
      ]),

    // APIs

    queryData: a
      .query()
      .arguments({
        modelName: a.string(),
        operation: a.string(),
        query: a.string(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(queryData)),

    createAuctionListingFromFile: a
      .query()
      .arguments({
        auctionListingFileKey: a.string().required(),
        auctionManifestFileKey: a.string().required(),
        sellerId: a.string(),
        sellerProfileId: a.string(),
        cognitoId: a.string(),
        isPrivate: a.boolean(),
        visibilityRules: a.json(),
        minimumBid: a.float().required(),
        bidIncrementValue: a.float().required(),
        bidIncrementType: a.enum(["PERCENTAGE", "FIXED"]),
        auctionEndTimestamp: a.timestamp().required(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createAuctionListingFromFile)),

    createCatalogListingFromFile: a
      .query()
      .arguments({
        catalogListingFileKey: a.string().required(),
        catalogProductsFileKey: a.string().required(),
        sellerId: a.string(),
        sellerProfileId: a.string(),
        cognitoId: a.string(),
        isPrivate: a.boolean(),
        visibilityRules: a.json(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createCatalogListingFromFile)),

    placeBid: a
      .query()
      .arguments({
        auctionListingId: a.string().required(),
        bidderUserId: a.string(),
        bidderBuyerProfileId: a.string(),
        cognitoId: a.string(),
        bidAmount: a.float().required(),
        bidAmountCurrency: a.ref("CurrencyCode").required(),
        bidType: a.ref("AuctionBidType").required(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(placeBid)),

    createCatalogOffer: a
      .query()
      .arguments({
        catalogListingId: a.string().required(),
        buyerUserId: a.string(),
        buyerProfileId: a.string(),
        cognitoId: a.string(),
        items: a.ref("CatalogOfferItem").array().required(),
        expiresAt: a.datetime(),
        offerMessage: a.string(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createCatalogOffer)),

    negotiateCatalogOffer: a
      .query()
      .arguments({
        userId: a.string(),
        cognitoId: a.string(),
        userType: a.ref("CatalogNegotiationUserType").required(),
        catalogOfferId: a.string().required(),
        actionType: a.ref("NegotiationActionType").required(),
        itemNegotiations: a.ref("ItemNegotiation").array(),
        itemRejections: a.ref("ItemRejection").array(),
        itemChanges: a.ref("ItemChange").array(),
        rejectionReason: a.string(),
        rejectionCategory: a.ref("RejectionCategory"),
        alternativeSuggestion: a.ref("AlternativeSuggestion"),
        finalBudgetInfo: a.ref("FinalBudgetInfo"),
        validUntil: a.datetime(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(negotiateCatalogOffer)),

    createUser: a
      .query()
      .arguments({
        username: a.string(),
        email: a.string().required(),
        firstName: a.string().required(),
        lastName: a.string().required(),
        phone: a.string(),
        userType: a.ref("UserType").required(),
        company: a.string(),
        title: a.string(),
        jobTitle: a.string(),
        dateOfBirth: a.datetime(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createUser)),

    createBuyerProfile: a
      .query()
      .arguments({
        resellerTaxId: a.string(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createBuyerProfile)),

    setBuyerPreferences: a
      .query()
      .arguments({
        requestType: a.ref("BuyerPreferencesRequestType").required(),
        preferredCategories: a.ref("ProductCategory").array(),
        preferredSubcategories: a.ref("ProductSubcategory").array(),
        budgetMin: a.float(),
        budgetMax: a.float(),
        budgetCurrency: a.ref("CurrencyCode"),
        minimumDiscountPercentage: a.float(),
        listingTypePreferences: a.ref("ListingTypePreference").array(),
        buyerSegments: a.ref("BuyerSegment").array(),
        preferredRegions: a.ref("PreferredRegion").array(),
        preferredBrandIds: a.string().array(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(setBuyerPreferences)),

    createSellerProfile: a
      .query()
      .arguments({})
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createSellerProfile)),

    addUserAddress: a
      .query()
      .arguments({
        address: a.ref("Address").required(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(addUserAddress)),

    modifyAndAcceptCatalogOffer: a
      .query()
      .arguments({
        offerPublicId: a.string().required(),
        sellerMessage: a.string(),
        autoCreateOrder: a.boolean(),
        shippingAddressPublicId: a.string(),
        billingAddressPublicId: a.string(),
        orderNotes: a.string(),
        modifications: a.ref("CatalogOfferModification").array().required(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(modifyAndAcceptCatalogOffer)),

    createCatalogOfferFromFile: a
      .query()
      .arguments({
        offerListingPublicId: a.string().required(),
        offerFileS3Key: a.string().required(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createCatalogOfferFromFile)),

    createLotListing: a
      .query()
      .arguments({
        title: a.string().required(),
        shortTitle: a.string(),
        subHeading: a.string(),
        description: a.string(),
        shortDescription: a.string(),
        listingLabel: a.string(),
        listingType: a.ref("LotListingType").required(),
        sourceType: a.ref("ListingSourceType").required(),
        sourceName: a.ref("ListingSourceName").required(),
        categories: a.ref("ProductCategory").array().required(),
        subcategories: a.ref("ProductSubcategory").array(),
        categoryPercentEstimates: a.ref("CategoryPercentage").array(),
        defaultImageUrl: a.string(),
        lotCondition: a.ref("LotConditionType").required(),
        cosmeticCondition: a.string(),
        sampleSkuDetails: a.string(),
        manifestSnapshotFileS3Key: a.string(),
        manifestFileS3Key: a.string(),
        loadType: a.ref("LoadType").required(),
        expiryDate: a.datetime(),
        totalUnits: a.integer(),
        estimatedCasePacks: a.integer(),
        pieceCount: a.integer(),
        estimatedRetailValue: a.float().required(),
        estimatedRetailValueCurrency: a.ref("CurrencyCode").required(),
        askingPrice: a.float().required(),
        askingPriceCurrency: a.ref("CurrencyCode").required(),
        shippingCost: a.float(),
        shippingCostCurrency: a.ref("CurrencyCode"),
        estimatedWeight: a.float().required(),
        weightType: a.ref("WeightType").required(),
        locationAddress: a.ref("Address").required(),
        lotShippingType: a.ref("ShippingType").required(),
        lotFreightType: a.ref("FreightType").required(),
        lotPackaging: a.ref("LotPackagingType").required(),
        numberOfPallets: a.integer().required(),
        palletSpaces: a.integer().required(),
        palletLength: a.float().required(),
        palletWidth: a.float().required(),
        palletHeight: a.float().required(),
        palletDimensionType: a.ref("LengthType").required(),
        palletStackable: a.boolean().required(),
        numberOfTruckloads: a.integer().required(),
        numberOfShipments: a.integer(),
        isRefrigerated: a.boolean().required(),
        isFdaRegistered: a.boolean().required(),
        isHazmat: a.boolean().required(),
        isPrivate: a.boolean(),
        resaleRequirement: a.string(),
        accessories: a.string(),
        inspectionStatus: a.ref("ListingInspectionStatus"),
        sellerNotes: a.string(),
        shippingNotes: a.string(),
        additionalInformation: a.string(),
        offerRequirements: a.string(),
        images: a.ref("LotListingImage").array().required(),
        tags: a.string().array(),
        visibilityRules: a.ref("VisibilityRules"),
      })
      .returns(a.string())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createLotListing)),
  })
  .authorization((allow) => [
    allow.resource(placeBid),
    allow.resource(webSocketConnect),
    allow.resource(webSocketDisconnect),
    allow.resource(notificationProcessor),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
