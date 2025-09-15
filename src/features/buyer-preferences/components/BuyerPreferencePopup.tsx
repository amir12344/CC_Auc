"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { clearPreferenceListings } from "@/src/features/marketplace-catalog/store/preferenceListingsSlice";
import { useAppDispatch } from "@/src/lib/store";

import {
  DEFAULT_PREFERENCES,
  PREFERENCE_STEPS,
} from "../data/preferenceOptions";
import {
  setBuyerPreferences,
  transformLocalPreferencesToApiFormat,
} from "../services/buyerPreferenceService";
import { setBuyerPreferences as setBuyerPreferencesAction } from "../store/buyerPreferencesSlice";
import type {
  BuyerPreferences,
  StepComponentProps,
} from "../types/preferences";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { NavigationButtons } from "./NavigationButtons";
// Direct imports for step components
import { AuctionCatalogStep } from "./steps/AuctionCatalogStep";
import { BrandsStep } from "./steps/BrandsStep";
import { BudgetStep } from "./steps/BudgetStep";
import { CategoryStep } from "./steps/CategoryStep";
import { ConditionStep } from "./steps/ConditionStep";
import { RegionsStep } from "./steps/RegionsStep";
import { WhereYouSellStep } from "./steps/WhereYouSellStep";

// Type-safe component map
const STEP_COMPONENTS: Record<
  string,
  React.ComponentType<StepComponentProps>
> = {
  AuctionCatalogStep,
  BrandsStep,
  BudgetStep,
  CategoryStep,
  ConditionStep,
  WhereYouSellStep,
  RegionsStep,
} as const;

interface BuyerPreferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
  initialPreferences?: Partial<BuyerPreferences>;
}

export const BuyerPreferencePopup = ({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  initialPreferences = {},
}: BuyerPreferencePopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<BuyerPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
    preferredRegions: initialPreferences.preferredRegions ?? [],
    completedAt: initialPreferences.completedAt ?? null,
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Reset to first step when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setError(null);
    }
  }, [isOpen]);

  const totalSteps = PREFERENCE_STEPS.length;
  const currentStepData = PREFERENCE_STEPS[currentStep];

  const updatePreferences = useCallback(
    (updates: Partial<BuyerPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const completedPreferences = {
        ...preferences,
        isCompleted: true,
        completedAt: new Date(),
      };

      // Transform and send to API
      const apiPreferences =
        transformLocalPreferencesToApiFormat(completedPreferences);
      apiPreferences.requestType = "CREATE";
      const response = await setBuyerPreferences(apiPreferences);

      if (!response.success) {
        setError(response.message || "Failed to save preferences");
        setIsSaving(false);
        return;
      }

      // Update Redux and clear preference listings cache
      dispatch(
        setBuyerPreferencesAction({
          preferredCategories: apiPreferences.preferredCategories,
          preferredSubcategories: apiPreferences.preferredSubcategories,
          budgetMin: apiPreferences.budgetMin ?? null,
          budgetMax: apiPreferences.budgetMax ?? null,
          budgetCurrency: apiPreferences.budgetCurrency,
          minimumDiscountPercentage:
            apiPreferences.minimumDiscountPercentage ?? 0,
          listingTypePreferences: apiPreferences.listingTypePreferences,
          buyerSegments: apiPreferences.buyerSegments,
          preferredRegions: apiPreferences.preferredRegions,
          preferredBrandIds: apiPreferences.preferredBrandIds,
        })
      );
      dispatch(clearPreferenceListings());

      // Complete the popup - no need to store in local storage as we're using API
      onComplete();
    } catch (err) {
      setError(
        `An unexpected error occurred while saving preferences: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setIsSaving(false);
    }
  }, [preferences, onComplete, dispatch]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete().catch(() => {
        // Error is already handled in handleComplete
        setIsSaving(false);
      });
    }
  }, [currentStep, totalSteps, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleCloseAttempt = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    onClose();
  }, [onClose]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  const stepProps = useMemo(
    () => ({
      preferences,
      updatePreferences,
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1,
    }),
    [
      preferences,
      updatePreferences,
      handleNext,
      handleBack,
      currentStep,
      totalSteps,
    ]
  );

  const renderCurrentStep = () => {
    const StepComponent = STEP_COMPONENTS[currentStepData.component];

    if (!StepComponent) {
      return (
        <div className="p-4 text-red-600">
          Component &quot;{currentStepData.component}&quot; not found. Please
          check the component configuration.
        </div>
      );
    }

    return <StepComponent {...stepProps} />;
  };

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setShowExitConfirm(true);
        }}
        open={isOpen}
      >
        <DialogContent
          aria-describedby="preference-popup-description"
          className="flex max-h-[90vh] max-w-md flex-col overflow-hidden p-0 sm:max-w-lg md:max-w-2xl"
          hideCloseButton={true}
        >
          {/* Header */}
          <DialogHeader className="border-b p-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold">
                  Set your Preferences
                </DialogTitle>
              </div>
              <Button
                className="h-8 w-8 p-0"
                onClick={handleCloseAttempt}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Step Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 px-6 pt-0 pb-2">
              <h2 className="text-foreground text-lg font-medium">
                {currentStepData.title}
              </h2>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-6 mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Component */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <React.Suspense
                fallback={
                  <div className="flex h-32 items-center justify-center">
                    <div className="text-sm text-gray-500">Loading step...</div>
                  </div>
                }
              >
                {renderCurrentStep()}
              </React.Suspense>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-shrink-0 border-t p-6">
            <NavigationButtons
              currentStep={currentStep}
              isSaving={isSaving}
              onBack={handleBack}
              onNext={handleNext}
              onSkip={onSkip}
              totalSteps={totalSteps}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmDialog
        isOpen={showExitConfirm}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
      />
    </>
  );
};
