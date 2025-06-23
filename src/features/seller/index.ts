/**
 * Seller Feature Barrel Export
 * 
 * Centralized exports for the seller feature module
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Core listing types
  AuctionListing,
  BasicDetails,
  ShippingDetails,
  VisibilityDetails,
  SaleOptions,
  Policies,
  
  // Enum types
  Dimensions,
  PackagingType,
  ConditionType,
  CosmeticCondition,
  AccessoriesStatus,
  ShippingType,
  FreightType,
  BuyerType,
  ListingStatus,
  CategoryType,
  
  // Form state types
  FormSectionStatus,
  ListingFormState,
  
  // API types
  CreateListingResponse,
  FileUploadResponse,
  BulkCreateResponse,
  
  // Constants
  RequiredFields,
} from './types/listing';

export type {
  // Form component types
  FormSectionProps,
  FormFieldProps,
  CustomInputProps,
  CustomSelectProps,
  SelectOption,
  CustomTextareaProps,
  DimensionsInputProps,
  CurrencyInputProps,
  FileUploadProps,
  ImageUploadProps,
  RadioGroupProps,
  RadioOption,
  CheckboxProps,
  
  // Validation types
  FieldValidation,
  SectionValidation,
  FormValidation,
  
  // Form state management types
  FormStep,
  FormNavigationProps,
  FormProgressProps,
  
  // Specialized component types
  CategorySelectorProps,
  DurationSelectorProps,
  DurationPreset,
  BuyerTypeSelectorProps,
  
  // Excel upload types
  ExcelUploadFormProps,
  ExcelValidationResult,
  ExcelUploadState,
} from './types/forms';

// =============================================================================
// CONSTANTS
// =============================================================================

export { CATEGORIES } from './types/listing';
export { FORM_CONSTANTS } from './types/forms';

// =============================================================================
// COMPONENTS
// =============================================================================

// Main form components (will be exported once created)
// export { AuctionListingForm } from './components/AuctionListingForm';
// export { ExcelUploadForm } from './components/ExcelUploadForm';

// Reusable form components (will be exported once created)
// export { FormSection } from './components/shared/FormSection';
// export { FormField } from './components/shared/FormField';

// Form sections (will be exported once created)
// export { BasicDetailsSection } from './components/listing-creation/BasicDetailsSection';
// export { ShippingSection } from './components/listing-creation/ShippingSection';
// export { VisibilitySection } from './components/listing-creation/VisibilitySection';
// export { SaleOptionsSection } from './components/listing-creation/SaleOptionsSection';
// export { PoliciesSection } from './components/listing-creation/PoliciesSection';

// =============================================================================
// HOOKS
// =============================================================================

// Custom hooks (will be exported once created)
// export { useListingForm } from './hooks/useListingForm';
// export { useFileUpload } from './hooks/useFileUpload';
// export { useListingSubmission } from './hooks/useListingSubmission';

// =============================================================================
// SERVICES
// =============================================================================

// API services (will be exported once created)
// export { listingAPI } from './services/listingAPI';
// export { fileUploadService } from './services/fileUploadService';

// =============================================================================
// STORE
// =============================================================================

// Redux store exports (will be exported once created)
// export { listingSlice } from './store/listingSlice';
// export * from './store/selectors'; 