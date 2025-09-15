/**
 * Condition Mapper Utility
 *
 * Maps simplified condition values from the UI to detailed condition names
 * that can be used with the fileToDbConditionBiMap and fileToDbLotConditionBiMap.
 *
 * This utility bridges the gap between user-friendly condition names in the UI
 * and the detailed condition names expected by the database mapping functions.
 */

/**
 * Maps simplified condition values to detailed condition names for catalog listings
 * @param condition - Simplified condition value from UI ('new', 'refurbished', 'used') or specific condition names
 * @returns Array of detailed condition names that match the simplified condition
 */
export function mapSimplifiedConditionToCatalogConditions(
  condition: string
): string[] {
  switch (condition.toLowerCase()) {
    case "new":
      return [
        "New - Retail & Ecommerce Ready",
        "New - Open Box",
        "New - Damaged Box",
        "New - Bulk Packaged",
      ];

    case "refurbished":
      return [
        "Refurbished - Manufacturer Certified",
        "Refurbished - Seller Refurbished",
      ];

    case "used":
      return ["Used - Like New", "Used - Good", "Used - Fair", "Used - As-Is"];

    // Handle specific detailed conditions directly
    case "new - retail & ecommerce ready":
      return ["New - Retail & Ecommerce Ready"];

    case "new - open box":
      return ["New - Open Box"];

    case "new - damaged box":
      return ["New - Damaged Box"];

    case "new - bulk packaged":
      return ["New - Bulk Packaged"];

    case "refurbished - manufacturer certified":
      return ["Refurbished - Manufacturer Certified"];

    case "refurbished - seller refurbished":
      return ["Refurbished - Seller Refurbished"];

    case "used - like new":
      return ["Used - Like New"];

    case "used - good":
      return ["Used - Good"];

    case "used - fair":
      return ["Used - Fair"];

    case "used - as-is":
      return ["Used - As-Is"];

    case "damaged":
      return ["Damaged - Functional", "Damaged - Non-Functional"];

    case "salvage":
      return ["Salvage - Parts Only"];

    case "mixed condition":
      return ["Mixed Condition"];

    case "shelf pulls":
      return ["Shelf Pulls"];

    case "closeouts":
      return ["Closeouts"];

    case "overstock":
      return ["Overstock"];

    case "expired / short-dated":
    case "expired/short-dated":
      return ["Expired / Short-Dated"];

    case "uninspected returns":
      return ["Uninspected Returns"];

    case "cracked / broken":
    case "cracked/broken":
      return ["Cracked / Broken"];

    default:
      // If no mapping found, return the original condition as-is
      // This allows direct condition names to pass through
      return [condition];
  }
}

/**
 * Maps simplified condition values to detailed condition names for auction listings
 * @param condition - Simplified condition value from UI ('new', 'refurbished', 'used') or specific condition names
 * @returns Array of detailed condition names that match the simplified condition
 */
export function mapSimplifiedConditionToAuctionConditions(
  condition: string
): string[] {
  switch (condition.toLowerCase()) {
    case "new":
      return ["New", "Like New"];

    case "refurbished":
      return ["Refurbished"];

    case "used":
      return ["Used"];

    // Handle specific detailed conditions directly
    case "salvage":
      return ["Salvage"];

    case "customer returns":
    case "customer_returns":
      return ["Customer_Returns"];

    case "damaged":
      return ["Damaged"];

    case "scratch and dent":
    case "scratch_and_dent":
      return ["Scratch And Dent"];

    case "mixed":
    case "mixed condition":
      return ["Mixed"];

    case "shelf pulls":
    case "shelf_pulls":
      return ["Shelf_Pulls"];

    case "unknown":
      return ["Unknown"];

    case "closeouts":
      return ["Closeouts"];

    case "overstock":
      return ["Overstock"];

    case "like new":
      return ["Like New"];

    default:
      // If no mapping found, return the original condition as-is
      // This allows direct condition names to pass through
      return [condition];
  }
}

/**
 * Gets the first available detailed condition name for catalog listings
 * @param condition - Simplified condition value from UI
 * @returns First detailed condition name or undefined if no match
 */
export function getFirstCatalogCondition(
  condition: string
): string | undefined {
  const conditions = mapSimplifiedConditionToCatalogConditions(condition);
  return conditions.length > 0 ? conditions[0] : undefined;
}

/**
 * Gets the first available detailed condition name for auction listings
 * @param condition - Simplified condition value from UI
 * @returns First detailed condition name or undefined if no match
 */
export function getFirstAuctionCondition(
  condition: string
): string | undefined {
  const conditions = mapSimplifiedConditionToAuctionConditions(condition);
  return conditions.length > 0 ? conditions[0] : undefined;
}
