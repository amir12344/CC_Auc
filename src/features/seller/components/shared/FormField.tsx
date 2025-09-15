"use client";

import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";

import { FormFieldProps } from "../../types/forms";

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
    <div className={cn("w-full space-y-2", className)}>
      <Label
        className={cn(
          "text-sm leading-none font-medium text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          labelClassName
        )}
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
      </Label>

      {description && (
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      )}

      <div className="space-y-1">
        {children}

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
