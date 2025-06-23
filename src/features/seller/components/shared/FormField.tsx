'use client';

import { FormFieldProps } from '../../types/forms';
import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/lib/utils';

/**
 * Reusable form field wrapper component
 * 
 * Provides consistent styling and behavior for form fields including
 * labels, error messages, descriptions, and required field indicators.
 * Optimized for mobile-first responsive design.
 */
export function FormField({
  label,
  children,
  required = false,
  error,
  description,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <Label 
        className={cn(
          'text-sm font-medium leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          labelClassName
        )}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </Label>
      
      {description && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="space-y-1">
        {children}
        
        {error && (
          <p className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
} 
