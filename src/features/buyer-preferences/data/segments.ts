/** Display ↔ enum mappings for buyer segments */
export const BUYER_SEGMENT_DISPLAY: Record<string, string> = {
  DISCOUNT_RETAIL: "Discount Retail",
  STOCKX: "StockX",
  AMAZON_OR_WALMART: "Amazon & Walmart",
  LIVE_SELLER_MARKETPLACES: "Live Seller",
  RESELLER_MARKETPLACES: "Reseller",
  OFF_PRICE_RETAIL: "Off-Price Retail",
  EXPORTER: "Export",
  REFURBISHER_REPAIR_SHOP: "Refurbisher",
};

export function getBuyerSegmentDisplayName(segment: string): string {
  return BUYER_SEGMENT_DISPLAY[segment] || segment;
}

export function getSegmentEnumFromDisplayName(displayName: string): string {
  const reverseMap = Object.entries(BUYER_SEGMENT_DISPLAY).reduce(
    (acc, [enumValue, label]) => {
      acc[label] = enumValue;
      return acc;
    },
    {} as Record<string, string>
  );
  return (
    reverseMap[displayName] || displayName.toUpperCase().replace(/\s/g, "_")
  );
}
