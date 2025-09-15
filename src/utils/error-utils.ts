/**
 * Types for backend error handling
 */
export interface ValidationError {
  field: string;
  message: string;
  provided_value?: unknown;
  expected_format?: string;
}

export interface BackendErrorDetails {
  validation_errors?: ValidationError[];
  suggested_actions?: string[];
  [key: string]: unknown;
}

export interface BackendError {
  code?: string;
  message?: string;
  details?: BackendErrorDetails;
}

/**
 * List of sensitive keys that should never be displayed in error messages
 * This ensures cognito_id and other sensitive data is never shown to users
 */
export const SENSITIVE_KEYS = [
  "cognito_id",
  "cognitoid",
  "user_id",
  "userid",
  "cognito_identity",
  "cognito_sub",
  "sub",
  "identity_id",
  "identityid",
  "email",
  "phone",
  "address",
  "password",
  "access_token",
  "refresh_token",
  "session_token",
  "api_key",
  "apikey",
  "secret",
  "token",
  "configuration",
  "config",
  "duration",
  "cataloglistingfile",
  "catalogproductsfile",
  "isprivate",
];

/**
 * Regex patterns for sanitizing error messages - defined at top level for performance
 */
const COGNITO_ID_PATTERN =
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
const COGNITO_FIELD_PATTERN = new RegExp(
  `cognito[_\\s]*id[:\\s]+${COGNITO_ID_PATTERN.source}`,
  "gi"
);
const FOR_COGNITO_PATTERN = new RegExp(
  `for\\s*cognito[_\\s]*id[:\\s]+${COGNITO_ID_PATTERN.source}`,
  "gi"
);
const WHITESPACE_PATTERN = /\\s+/g;

/**
 * Format mappings for validation errors
 */
export const FORMAT_MAPPINGS: Record<string, string> = {
  "array length <= 50": "maximum 50 items",
  "array length >= 1": "at least 1 item",
  "number > 0": "greater than 0",
  "number >= 1": "at least 1",
  "string length <= 255": "maximum 255 characters",
  "string length >= 1": "at least 1 character",
  "valid email format": "valid email address",
  "valid phone format": "valid phone number",
  "ISO date format": "valid date format",
};

/**
 * Dynamic error title generator based on error code
 * This replaces hardcoded ERROR_TITLES with a more flexible approach
 */
export const getErrorTitle = (code: string): string => {
  // Convert error code to title case and replace underscores with spaces
  const baseTitle = code
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Special cases that need custom formatting for better user experience
  const specialCases: Record<string, string> = {
    BUYER_NOT_VERIFIED: "Account Verification Required",
    INSUFFICIENT_INVENTORY: "Insufficient Stock",
    UNAUTHORIZED_ACCESS: "Access Denied",
    VALIDATION_ERROR: "Invalid Request Data",
    PRICE_VALIDATION_FAILED: "Price Validation Failed",
    EXCESSIVE_QUANTITY: "Quantity Limit Exceeded",
    EXISTING_ACTIVE_OFFER: "Active Offer Already Exists",
    CATALOG_NOT_FOUND: "Catalog Not Available",
    SELLER_UNAVAILABLE: "Seller Unavailable",
    AUCTION_NOT_FOUND: "Auction Not Available",
    AUCTION_ENDED: "Auction Has Ended",
    BID_TOO_LOW: "Bid Amount Too Low",
    INSUFFICIENT_FUNDS: "Insufficient Funds",
  };

  return specialCases[code] || baseTitle;
};

/**
 * Format expected value for validation errors
 */
export const formatExpectedValue = (expected: string): string => {
  return FORMAT_MAPPINGS[expected] || expected;
};

/**
 * Check if a key contains sensitive information
 */
const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(
    (sensitiveKey) =>
      lowerKey.includes(sensitiveKey) || sensitiveKey.includes(lowerKey)
  );
};

/**
 * Remove sensitive data from error messages
 * This function scans error messages and removes any sensitive information like cognito IDs
 */
const sanitizeErrorMessage = (message: string): string => {
  if (!message) {
    return message;
  }

  let sanitized = message;

  // Replace full patterns first to handle contextual IDs
  sanitized = sanitized.replace(FOR_COGNITO_PATTERN, "for user");
  sanitized = sanitized.replace(COGNITO_FIELD_PATTERN, "user ID");

  // Then remove any remaining loose IDs
  sanitized = sanitized.replace(COGNITO_ID_PATTERN, "");

  sanitized = sanitized.replace(WHITESPACE_PATTERN, " ").trim();

  return sanitized;
};

/**
 * Format error details while filtering out sensitive information
 * This ensures cognito_id and other sensitive data is never displayed
 */
export const formatErrorDetails = (details: BackendErrorDetails): string => {
  const parts: string[] = [];

  // Add basic details, filtering sensitive keys
  const basicDetails = Object.entries(details)
    .filter(
      ([key]) =>
        !(
          ["validation_errors", "suggested_actions"].includes(key) ||
          isSensitiveKey(key)
        )
    )
    .map(([key, value]) => {
      const displayKey = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      let displayValue: string;
      if (typeof value === "string") {
        displayValue = sanitizeErrorMessage(value);
      } else if (typeof value === "object" && value !== null) {
        // Don't display object details to avoid '[Object Object]'
        displayValue = "[Configuration details hidden]";
      } else {
        displayValue = String(value);
      }

      return `• ${displayKey}: ${displayValue}`;
    });

  if (basicDetails.length) {
    parts.push("Details:", ...basicDetails);
  }

  // Add validation errors if present, filtering sensitive fields
  if (details.validation_errors?.length) {
    if (parts.length) {
      parts.push("");
    }

    const filteredErrors = details.validation_errors.filter(
      (error) => !isSensitiveKey(error.field)
    );

    if (filteredErrors.length > 0) {
      parts.push(
        "Validation Issues:",
        ...filteredErrors.map((validationError) => {
          const sanitizedMessage = sanitizeErrorMessage(
            validationError.message
          );
          const messageParts = [
            `• ${validationError.field}: ${sanitizedMessage}`,
          ];
          if (validationError.provided_value !== undefined) {
            messageParts.push(
              `(you provided: ${validationError.provided_value})`
            );
          }
          if (validationError.expected_format) {
            messageParts.push(
              `(expected: ${formatExpectedValue(validationError.expected_format)})`
            );
          }
          return messageParts.join(" ");
        })
      );
    }
  }

  // Add suggested actions if present
  if (details.suggested_actions?.length) {
    if (parts.length) {
      parts.push("");
    }
    parts.push(
      "Suggested Actions:",
      ...details.suggested_actions.map(
        (action) => `• ${sanitizeErrorMessage(action)}`
      )
    );
  }

  return parts.length ? `\n\n${parts.join("\n")}` : "";
};

/**
 * Parse Excel upload specific errors to extract meaningful error details
 */

// Define regex patterns at top level
const MISSING_FIELDS_PATTERN = /Missing required fields: ([^"\n]+)/;
const FAILED_LISTINGS_PATTERN = /(\\d+) listing\\(s\\) failed/;
const LISTING_ERROR_PATTERN = /Errors: ([^:]+): (.+?)(?:\\n|$)/;
const MISSING_ARGUMENT_PATTERN = /Argument `([^`]+)` is missing/;
const MISSING_LINE_PATTERN = /\\+\\s+([^:]+):\\s*(.+)/;

/**
 * Handle DATA_VALIDATION_ERROR
 */
const handleDataValidationError = (errorDetails: string): string | null => {
  // Try to match the pattern from the backend error
  const missingFieldsMatch = errorDetails.match(MISSING_FIELDS_PATTERN);
  if (missingFieldsMatch) {
    const fieldsString = missingFieldsMatch[1].trim();
    // Split by comma and clean up field names
    const missingFields = fieldsString.split(",").map((field) => {
      return field
        .trim()
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    });
    return `Missing required fields: ${missingFields.join(", ")}`;
  }
  return null;
};

/**
 * Check for missing argument error
 */
const checkMissingArgument = (
  specificError: string,
  listingName: string
): string | null => {
  if (
    !(
      specificError.includes("Argument") && specificError.includes("is missing")
    )
  ) {
    return null;
  }

  const missingFieldMatch = specificError.match(MISSING_ARGUMENT_PATTERN);
  if (!missingFieldMatch) {
    return null;
  }

  const fieldName = missingFieldMatch[1];
  return `Import failed for "${listingName}": Missing required field '${fieldName}'`;
};

/**
 * Check for Prisma invocation error
 */
const checkPrismaError = (
  specificError: string,
  listingName: string
): string | null => {
  if (
    !(
      specificError.includes("Invalid `prisma.") &&
      specificError.includes("invocation:")
    )
  ) {
    return null;
  }

  const missingLineMatch = specificError.match(MISSING_LINE_PATTERN);
  if (!missingLineMatch) {
    return null;
  }

  const missingField = missingLineMatch[1].trim();
  return `Import failed for "${listingName}": Missing required field '${missingField}'`;
};

/**
 * Handle IMPORT_ERROR
 */
const handleImportError = (errorDetails: string): string | null => {
  const failedListingsMatch = errorDetails.match(FAILED_LISTINGS_PATTERN);
  if (!failedListingsMatch) {
    return null;
  }

  const failedCount = failedListingsMatch[1];

  const listingErrorMatch = errorDetails.match(LISTING_ERROR_PATTERN);
  if (!listingErrorMatch) {
    return `Import failed: ${failedCount} listing(s) had validation errors`;
  }

  const listingName = listingErrorMatch[1];
  const specificError = listingErrorMatch[2];

  let errorMsg = checkMissingArgument(specificError, listingName);
  if (errorMsg) {
    return errorMsg;
  }

  errorMsg = checkPrismaError(specificError, listingName);
  if (errorMsg) {
    return errorMsg;
  }

  const firstLine = specificError.split("\n")[0];
  if (firstLine && firstLine.length < 150) {
    return `Import failed for "${listingName}": ${firstLine}`;
  }

  return `Import failed for "${listingName}": Database validation error`;
};

/**
 * Extract error details from unknown error
 */
const getErrorDetails = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error !== "object" || error === null) {
    return "";
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if ("details" in error) {
    const details = error.details;
    if (
      typeof details === "object" &&
      details !== null &&
      "error" in details &&
      typeof (details as Record<string, unknown>).error === "string"
    ) {
      return (details as Record<string, string>).error;
    }
  }

  return "";
};

const parseExcelUploadError = (error: unknown): string | null => {
  try {
    // First try to get error details from the nested structure
    let errorDetails = getErrorDetails(error);

    // If error is an object with details.error, try to extract that
    if (typeof error === "object" && error !== null && "details" in error) {
      const details = (error as Record<string, unknown>).details;
      if (details && typeof details === "object" && "error" in details) {
        errorDetails = (details as Record<string, string>).error;
      }
    }

    if (!errorDetails) {
      return null;
    }

    // Handle DATA_VALIDATION_ERROR - Missing required fields
    if (errorDetails.includes("Missing required fields:")) {
      return handleDataValidationError(errorDetails);
    }

    // Handle IMPORT_ERROR - Extract the actual error details
    if (errorDetails.includes("listing(s) failed")) {
      return handleImportError(errorDetails);
    }

    return null;
  } catch {
    return null;
  }
};

// New function:
const handleStringError = (error: string): string => {
  const sanitizedError = sanitizeErrorMessage(error);

  const excelError = parseExcelUploadError(sanitizedError);
  if (excelError) {
    return excelError;
  }

  if (sanitizedError.includes("import failed")) {
    return "Import failed. Please check your Excel file format and try again.";
  }
  if (sanitizedError.includes("User not found")) {
    return "Authentication error. Please refresh and try again.";
  }
  return sanitizedError;
};

/**
 * Format backend error into user-friendly message
 * This is the main function that should be used throughout the application
 */
export const formatBackendError = (
  error: BackendError | string | unknown
): string => {
  if (!error) {
    return "An unexpected error occurred.";
  }

  if (typeof error === "string") {
    return handleStringError(error);
  }

  if (typeof error !== "object" || error === null) {
    return "An unexpected error occurred.";
  }

  const excelError = parseExcelUploadError(error);
  if (excelError) {
    return excelError;
  }

  const { code, message, details } = error as BackendError;
  const sanitizedMessage = sanitizeErrorMessage(message || "An error occurred");
  const title = getErrorTitle(code || "ERROR");
  const baseMessage = `${title}: ${sanitizedMessage}`;

  if (code === "USER_NOT_FOUND") {
    return "User not found. Please try logging in again.";
  }

  if (!details || typeof details !== "object") {
    return baseMessage;
  }

  // Handle case where details is an array (common backend response format)
  if (Array.isArray(details)) {
    const validationErrors = details
      .filter(
        (detail) =>
          detail &&
          typeof detail === "object" &&
          "field" in detail &&
          "message" in detail
      )
      .map((detail) => ({
        field: detail.field as string,
        message: detail.message as string,
        provided_value: detail.provided_value,
        expected_format: detail.expected_format,
      }));

    if (validationErrors.length > 0) {
      const formattedDetails = { validation_errors: validationErrors };
      return `${baseMessage}${formatErrorDetails(formattedDetails)}`;
    }
  }

  return `${baseMessage}${formatErrorDetails(details)}`;
};
