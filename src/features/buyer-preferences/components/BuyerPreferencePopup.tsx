'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';
import { X, Loader2 } from 'lucide-react';
import { BuyerPreferences } from '../types/preferences';
import { PREFERENCE_STEPS, DEFAULT_PREFERENCES } from '../data/preferenceOptions';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { NavigationButtons } from './NavigationButtons';

// Loading component for step transitions
const StepLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Loading step...</span>
    </div>
  </div>
);

// Dynamic imports using Next.js dynamic for better optimization
const BrandsStep = dynamic(
  () => import('./steps/BrandsStep').then(module => ({ default: module.BrandsStep })),
  { 
    loading: StepLoader,
    ssr: false // Client-side only for better performance with preference state
  }
);

const CategoryStep = dynamic(
  () => import('./steps/CategoryStep').then(module => ({ default: module.CategoryStep })),
  { 
    loading: StepLoader,
    ssr: false
  }
);

const BudgetStep = dynamic(
  () => import('./steps/BudgetStep').then(module => ({ default: module.BudgetStep })),
  { 
    loading: StepLoader,
    ssr: false
  }
);

const AuctionCatalogStep = dynamic(
  () => import('./steps/AuctionCatalogStep').then(module => ({ default: module.AuctionCatalogStep })),
  { 
    loading: StepLoader,
    ssr: false
  }
);

const WhereYouSellStep = dynamic(
  () => import('./steps/WhereYouSellStep').then(module => ({ default: module.WhereYouSellStep })),
  { 
    loading: StepLoader,
    ssr: false
  }
);

interface BuyerPreferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: BuyerPreferences) => void;
  onSkip: () => void;
  initialPreferences?: Partial<BuyerPreferences>;
}

export const BuyerPreferencePopup: React.FC<BuyerPreferencePopupProps> = ({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  initialPreferences = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<BuyerPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Reset to first step when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const totalSteps = PREFERENCE_STEPS.length;
  const currentStepData = PREFERENCE_STEPS[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updatePreferences = useCallback((updates: Partial<BuyerPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const handleComplete = useCallback(() => {
    const completedPreferences = {
      ...preferences,
      isCompleted: true,
      completedAt: new Date()
    };
    onComplete(completedPreferences);
  }, [preferences, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, totalSteps, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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

  const stepProps = useMemo(() => ({
    preferences,
    updatePreferences,
    onNext: handleNext,
    onBack: handleBack,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1
  }), [preferences, updatePreferences, handleNext, handleBack, currentStep, totalSteps]);

  const renderCurrentStep = () => {
    switch (currentStepData.component) {
      case 'BrandsStep':
        return <BrandsStep {...stepProps} />;
      case 'CategoryStep':
        return <CategoryStep {...stepProps} />;
      case 'BudgetStep':
        return <BudgetStep {...stepProps} />;
      case 'AuctionCatalogStep':
        return <AuctionCatalogStep {...stepProps} />;
      case 'WhereYouSellStep':
        return <WhereYouSellStep {...stepProps} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent 
          className="max-w-2xl h-[90vh] flex flex-col p-0" 
          hideCloseButton={true}
          aria-describedby="preference-popup-description"
        >
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold">
                  Personalize your homepage
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseAttempt}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          {/* Step Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 pt-6 pb-2 flex-shrink-0">
              <h2 className="text-lg font-medium text-foreground">
                {currentStepData.title}
              </h2>
              {currentStepData.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentStepData.description}
                </p>
              )}
            </div>

            {/* Step Component */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {renderCurrentStep()}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t p-6 flex-shrink-0">
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              onSkip={onSkip}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmDialog
        isOpen={showExitConfirm}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
}; 