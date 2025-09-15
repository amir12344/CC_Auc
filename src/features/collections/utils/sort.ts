import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";

export function sortCatalogListings(
  listings: CatalogListing[],
  sortBy: string
): CatalogListing[] {
  const items = [...listings];
  switch (sortBy) {
    case "price-asc":
      return items.sort(
        (a, b) => (a.minimum_order_value || 0) - (b.minimum_order_value || 0)
      );
    case "price-desc":
      return items.sort(
        (a, b) => (b.minimum_order_value || 0) - (a.minimum_order_value || 0)
      );
    case "name-asc":
      return items.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc":
      return items.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return items;
  }
}
