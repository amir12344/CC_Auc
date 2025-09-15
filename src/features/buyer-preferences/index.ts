// Main components
export { BuyerPreferencePopup } from "./components/BuyerPreferencePopup";
export { ExitConfirmDialog } from "./components/ExitConfirmDialog";
export { NavigationButtons } from "./components/NavigationButtons";

// Step components
export { BrandsStep } from "./components/steps/BrandsStep";
export { CategoryStep } from "./components/steps/CategoryStep";
export { BudgetStep } from "./components/steps/BudgetStep";
export { AuctionCatalogStep } from "./components/steps/AuctionCatalogStep";
export { WhereYouSellStep } from "./components/steps/WhereYouSellStep";

// Hooks
export { usePreferencePopup } from "./hooks/usePreferencePopup";
export { usePreferenceData } from "./hooks/usePreferenceData";

// Types
export type {
  BuyerPreferences,
  PreferenceStep,
  StepComponentProps,
  PopupState,
  PreferencePopupAction,
} from "./types/preferences";

// Data
export {
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DISCOUNT_OPTIONS,
  SELLING_PLATFORM_DETAILS,
  PREFERENCE_STEPS,
  DEFAULT_PREFERENCES,
} from "./data/preferenceOptions";
