// Offer Management feature barrel exports

// Component exports
export { default as BuildOfferModal } from "./components/BuildOfferModal";
export { OfferCartInitializer } from "./components/OfferCartInitializer";
export { default as OfferFooterBar } from "./components/OfferFooterBar";
export { default as OfferSummarySheet } from "./components/OfferSummarySheet";

// Hook exports
export { useLoadCartState } from "./hooks/useCartPersistence";
// Cart exports
export {
  addAllVariantsToCatalogOffer,
  addToCatalogOffer,
  addToOffer,
  clearCatalogOffer,
  clearOffer,
  initializeFromStorage,
  removeFromCatalogOffer,
  removeFromOffer,
  removeProductFromCatalogOffer,
  removeProductFromOffer,
  selectCurrentCatalogItems,
  selectCurrentCatalogTotals,
  selectOfferItems,
  selectOfferTotals,
  setCatalogContext,
} from "./store/offerCartSlice";
// Store exports
// Re-export offer slice as default for store configuration
export {
  closeOfferModal,
  default as offerReducer,
  openOfferModal,
  updateVariant,
  updateVariantInventory,
  updateVariantPrice,
} from "./store/offerSlice";
// Type exports
// Additional type exports
export type {
  CatalogContext,
  CatalogOffer,
  EnhancedProduct,
  GroupedProduct,
  OfferCartItem,
  OfferCartState,
  OfferItem,
  OfferResponse,
  OfferState,
  OfferSubmissionPayload,
  OfferVariant,
} from "./types";
