'use client';

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';

interface FormActionsProps {
  areFilesSelected: boolean;
  isFormDisabled: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  submitButtonText: string;
  loadingText: string;
  missingFilesMessage: string;
  onClearForm: () => void;
  onSubmit?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Reusable form actions component with submit and clear buttons
 * Used by both auction and catalog upload forms
 */
export const FormActions: React.FC<FormActionsProps> = ({
  areFilesSelected,
  isFormDisabled,
  isSubmitting,
  isUploading,
  submitButtonText,
  loadingText,
  missingFilesMessage,
  onClearForm,
  onSubmit,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="pt-6">
        {!areFilesSelected && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-800">
                  {missingFilesMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClearForm}
            className="h-12 px-8"
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="h-12 px-8 bg-[#43CD66] hover:bg-[#3ab859] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              // Prevent double-click submissions
              if (isUploading || isSubmitting) {
                e.preventDefault();
                return;
              }
              onSubmit?.(e);
            }}
          >
            {isSubmitting || isUploading ? loadingText : submitButtonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 