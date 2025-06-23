'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  canSkip?: boolean;
  isLoading?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  canSkip = true,
  isLoading = false
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        
        {canSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </Button>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        {isLastStep ? 'Complete' : 'Next'}
        {!isLastStep && <ArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}; 