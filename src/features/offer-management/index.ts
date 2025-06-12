// Offer Management feature barrel exports

// Store exports
export { 
  openOfferModal, 
  closeOfferModal, 
  updateVariant, 
  updateVariantUnits 
} from './store/offerSlice';
export type { OfferVariant, OfferState } from './store/offerSlice';

// Cart exports
export { addToOffer, removeFromOffer, selectOfferItems, selectOfferTotals, clearOffer, updateOfferItem } from './store/offerCartSlice';
export type { OfferCartItem, OfferCartState } from './store/offerCartSlice';

// Types exports
export type {
  OfferItem,
  OfferSubmissionPayload,
  OfferResponse
} from './types';

// Hook exports
export { useLoadCartState } from './hooks/useCartPersistence';

// Component exports
export { default as BuildOfferModal } from './components/BuildOfferModal';
export { default as OfferSummarySheet } from './components/OfferSummarySheet';
export { default as OfferFooterBar } from './components/OfferFooterBar';

// Re-export offer slice as default for store configuration
export { default as offerReducer } from './store/offerSlice';