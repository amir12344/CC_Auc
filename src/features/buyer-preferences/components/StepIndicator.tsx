'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    title: string;
    isCompleted?: boolean;
  }>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index === currentStep
                  ? 'bg-blue-600 text-white'
                  : index < currentStep || step.isCompleted
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {index < currentStep || step.isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
          </div>
          
          {index < totalSteps - 1 && (
            <div
              className={`
                w-8 h-0.5 mx-2
                ${index < currentStep
                  ? 'bg-green-600'
                  : 'bg-gray-200'
                }
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 