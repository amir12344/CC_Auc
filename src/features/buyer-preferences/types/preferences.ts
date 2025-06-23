export interface BuyerPreferences {
  brands: string[];
  categories: string[];
  subcategories: string[];
  minBudget: number | null;
  maxBudget: number | null;
  minimumDiscount: string;
  preferredTypes: ('auction' | 'catalog')[];
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
  isCompleted: boolean;
  completedAt?: Date;
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
  | { type: 'OPEN_POPUP' }
  | { type: 'CLOSE_POPUP' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_POPUP' }
  | { type: 'COMPLETE_POPUP' }
  | { type: 'SET_STEP'; step: number }; 