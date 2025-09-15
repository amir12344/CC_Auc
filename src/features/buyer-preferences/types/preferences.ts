export interface BuyerPreferences {
  brands: string[];
  categories: string[];
  subcategories: string[];
  minBudget: number | null;
  maxBudget: number | null;
  minimumDiscount: string;
  preferredTypes: string[];
  conditions: string[];
  sellingPlatforms: {
    discountRetail: boolean;
    stockX: boolean;
    amazonWalmart: boolean;
    liveMarketplaces: boolean;
    resellerMarketplaces: boolean;
    offPriceRetail: boolean;
    export: boolean;
    refurbisher: boolean;
  };
  preferredRegions: string[]; // New field for selected regions
  isCompleted: boolean;
  completedAt: Date | null;
}

export interface PreferenceStep {
  id: string;
  title: string;
  description?: string;
  component: string;
  isRequired?: boolean;
  isCompleted?: boolean;
}

export interface StepComponentProps {
  preferences: BuyerPreferences;
  updatePreferences: (updates: Partial<BuyerPreferences>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface PopupState {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  hasStarted: boolean;
  canSkip: boolean;
}

export type PreferencePopupAction =
  | { type: "OPEN_POPUP" }
  | { type: "CLOSE_POPUP" }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "SKIP_POPUP" }
  | { type: "COMPLETE_POPUP" }
  | { type: "SET_STEP"; step: number };

export interface Brand {
  brand_name: string;
  public_id: string;
}

// Use the actual Schema types instead of manually defining them
export interface BuyerPreferenceApiRequest {
  requestType: "CREATE";
  preferredCategories?: string[];
  preferredSubcategories?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetCurrency?: string;
  minimumDiscountPercentage?: number;
  listingTypePreferences?: string[];
  buyerSegments?: string[];
  preferredRegions?: string[];
  preferredBrandIds?: string[];
}

export interface GetBuyerPreferenceApiRequest {
  preferredCategories?: string[];
  preferredSubcategories?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetCurrency?: string;
  minimumDiscountPercentage?: number;
  listingTypePreferences?: string[];
  buyerSegments?: string[];
  preferredRegions?: string[];
  preferredBrandIds?: string[];
}

export interface BuyerPreferenceApiResponse {
  success: boolean;
  message?: string;
  preferences?: BuyerPreferenceApiRequest;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp?: string;
    request_id?: string;
  };
}
export interface LocalBuyerPreferences {
  categories?: string[];
  subcategories?: string[];
  minBudget?: number | null;
  maxBudget?: number | null;
  minimumDiscount?: string;
  preferredTypes?: string[];
  sellingPlatforms?: Record<string, boolean>;
  brands?: string[];
  isCompleted?: boolean;
  completedAt?: Date;
  conditions?: string[];
  preferredRegions?: string[];
}

export interface BuyerPreferencesApiResponseData {
  buyer_profile_preferences?: Array<{
    preferred_categories?: string[];
    preferred_subcategories?: string[];
    budget_min?: number | null;
    budget_max?: number | null;
    budget_currency?: string;
    minimum_discount_percentage?: number;
    listing_type_preferences?: string[];
    buyer_segments?: string[];
    preferred_regions?: string[];
    // Add preferred_brand_ids if it will be included in the future
  }>;
  buyer_profiles?: {
    buyer_brand_preferences?: Array<{
      brands?: {
        brand_name: string;
        public_id: string;
      };
    }>;
  };
}
