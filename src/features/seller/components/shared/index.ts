// Shared components for seller forms
export { FileUploadArea } from './FileUploadArea';
export { VisibilitySection, BUYER_TARGETING_OPTIONS } from './VisibilitySection';
export { GeographicRestrictions } from './GeographicRestrictions';
export { FormActions } from './FormActions';
export { AuctionSaleOptions } from './AuctionSaleOptions';

// Re-export hooks for convenience
export { useFileUpload, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../../hooks/useFileUpload';
export { useDragAndDrop } from '../../hooks/useDragAndDrop';

// Common utilities
export const getErrorMessage = (error: any): string | undefined => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return undefined;
}; 