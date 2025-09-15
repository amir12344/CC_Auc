/**
 * Utility functions for file handling and display
 */

/**
 * Truncates a file name to a maximum length while preserving the file extension
 * @param fileName - The original file name
 * @param maxLength - Maximum length for the truncated name (default: 40)
 * @returns Truncated file name with ellipsis if needed
 */
export const truncateFileName = (
  fileName: string,
  maxLength: number = 40
): string => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  // Find the last dot to separate name and extension
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // No extension found, just truncate with ellipsis
    return fileName.substring(0, maxLength - 3) + "...";
  }

  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExtension = fileName.substring(0, lastDotIndex);

  // Calculate how much space we have for the name part
  const maxNameLength = maxLength - extension.length - 3; // 3 for '...'

  if (maxNameLength <= 0) {
    // Extension is too long, just show part of the full name
    return fileName.substring(0, maxLength - 3) + "...";
  }

  return nameWithoutExtension.substring(0, maxNameLength) + "..." + extension;
};

/**
 * Gets a tooltip-friendly full file name for display
 * @param fileName - The original file name
 * @returns The full file name
 */
export const getFullFileName = (fileName: string): string => {
  return fileName;
};
