"use client";

import React from "react";

import { Button } from "@/src/components/ui/button";

export interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  isSaving = false,
}: NavigationButtonsProps) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between">
      <div>
        {isFirstStep ? (
          <Button
            className="cursor-pointer rounded-full border border-gray-300 px-5 py-2.5 shadow-none hover:bg-gray-100"
            onClick={onSkip}
            type="button"
            variant="outline"
          >
            Skip for now
          </Button>
        ) : (
          <Button
            className="cursor-pointer rounded-full border border-gray-300 px-5 py-2.5 shadow-none hover:bg-gray-100"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Back
          </Button>
        )}
      </div>
      <Button
        className="cursor-pointer rounded-full bg-black px-5 py-2.5 text-white shadow-none hover:bg-gray-800"
        disabled={isSaving}
        onClick={onNext}
        type="button"
      >
        {isLastStep ? (isSaving ? "Saving..." : "Complete") : "Next"}
      </Button>
    </div>
  );
};
