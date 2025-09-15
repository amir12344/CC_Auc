/**
 * Seller Form Types
 *
 * Form-specific type definitions for reusable components
 * and validation schemas
 */
import { ReactNode } from "react";

// =============================================================================
// REUSABLE FORM COMPONENT TYPES
// =============================================================================

/**
 * Form section wrapper component props
 */
export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  isRequired?: boolean;
  isComplete?: boolean;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Form field wrapper component props
 */
export interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  labelClassName?: string;
}

/**
 * Custom input component props
 */
export interface CustomInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  type?: "text" | "number" | "email" | "tel" | "password";
}

/**
 * Custom select component props
 */
export interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * Select option interface
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Custom textarea component props
 */
export interface CustomTextareaProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * Dimensions input component props
 */
export interface DimensionsInputProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  value?: {
    width: number;
    length: number;
    height: number;
    unit: "in" | "cm" | "ft" | "m";
  };
  onChange?: (dimensions: {
    width: number;
    length: number;
    height: number;
    unit: "in" | "cm" | "ft" | "m";
  }) => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * Currency input component props
 */
export interface CurrencyInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  currency?: "USD" | "EUR" | "GBP";
  className?: string;
  min?: number;
  max?: number;
}

/**
 * File upload component props
 */
export interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  onBlur?: () => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
  preview?: boolean;
}

/**
 * Image upload component props (specialized file upload)
 */
export interface ImageUploadProps extends Omit<FileUploadProps, "accept"> {
  accept?: string; // Allow override but default to images
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
}

/**
 * Radio group component props
 */
export interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Radio option interface
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Checkbox component props
 */
export interface CheckboxProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  className?: string;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Field validation result
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Section validation result
 */
export interface SectionValidation {
  isValid: boolean;
  errors: Record<string, string>;
  completedFields: number;
  totalFields: number;
}

/**
 * Form validation result
 */
export interface FormValidation {
  isValid: boolean;
  sections: {
    basicDetails: SectionValidation;
    shipping: SectionValidation;
    visibility: SectionValidation;
    saleOptions: SectionValidation;
    policies: SectionValidation;
  };
  overallProgress: number; // 0-100
}

// =============================================================================
// FORM STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Form step information
 */
export interface FormStep {
  id: string;
  title: string;
  description: string;
  component: ReactNode;
  isComplete: boolean;
  isRequired: boolean;
}

/**
 * Form navigation props
 */
export interface FormNavigationProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  canNavigate: (targetStep: number) => boolean;
  className?: string;
}

/**
 * Form progress indicator props
 */
export interface FormProgressProps {
  steps: FormStep[];
  currentStep: number;
  className?: string;
  showLabels?: boolean;
  orientation?: "horizontal" | "vertical";
}

// =============================================================================
// SPECIALIZED COMPONENT TYPES
// =============================================================================

/**
 * Category selector component props
 */
export interface CategorySelectorProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  value?: string;
  onChange?: (category: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
}

/**
 * Duration selector component props (for auction duration)
 */
export interface DurationSelectorProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  value?: number;
  onChange?: (days: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  presets?: DurationPreset[];
  allowCustom?: boolean;
  className?: string;
}

/**
 * Duration preset option
 */
export interface DurationPreset {
  label: string;
  value: number;
  description?: string;
}

/**
 * Buyer type selector component props
 */
export interface BuyerTypeSelectorProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  value?: string[];
  onChange?: (buyerTypes: string[]) => void;
  onBlur?: () => void;
  maxSelections?: number;
  className?: string;
}

// =============================================================================
// EXCEL UPLOAD SPECIFIC TYPES
// =============================================================================

/**
 * Excel upload form props
 */
export interface ExcelUploadFormProps {
  onUploadComplete?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Excel file validation result
 */
export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  validRows: number;
  invalidRows: number;
  preview?: any[];
}

/**
 * Excel upload state
 */
export interface ExcelUploadState {
  file: File | null;
  validation: ExcelValidationResult | null;
  isUploading: boolean;
  isValidating: boolean;
  uploadProgress: number;
  error: string | null;
  success: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Common form constants
 */
export const FORM_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_LISTING: 10,
  SUPPORTED_IMAGE_FORMATS: ["jpg", "jpeg", "png", "webp"],
  SUPPORTED_VIDEO_FORMATS: ["mp4", "mov", "avi"],
  SUPPORTED_EXCEL_FORMATS: ["xlsx", "xls", "csv"],
  MIN_AUCTION_DURATION: 1,
  MAX_AUCTION_DURATION: 30,
  DEFAULT_CURRENCY: "USD" as const,
  DEFAULT_DIMENSION_UNIT: "in" as const,
} as const;
