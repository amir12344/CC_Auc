/**
 * @fileoverview Centralized service for handling and mapping authentication errors.
 * This service provides a consistent way to interpret Amplify errors and convert
 * them into user-friendly messages and recovery actions.
 */

export interface HandledError {
  title: string;
  description: string;
  recoveryAction?: "redirect" | "retry" | "none";
  recoveryPath?: string;
}

const defaultError: HandledError = {
  title: "An Unexpected Error Occurred",
  description:
    "Something went wrong. Please try again or contact support if the issue persists.",
  recoveryAction: "retry",
};

const errorMap: Record<string, HandledError> = {
  // --- Sign-In Errors ---
  UserNotFoundException: {
    title: "Login Failed",
    description:
      "The email address you entered does not exist. Please check your email or sign up.",
    recoveryAction: "none",
  },
  NotAuthorizedException: {
    title: "Login Failed",
    description: "Incorrect password. Please try again.",
    recoveryAction: "none",
  },
  UserAlreadyAuthenticatedException: {
    title: "Already Logged In",
    description: "You are already authenticated. Redirecting...",
    recoveryAction: "redirect",
    recoveryPath: "/marketplace",
  },
  LimitExceededException: {
    title: "Too Many Attempts",
    description:
      "Your account has been temporarily locked due to too many failed login attempts. Please try again later.",
    recoveryAction: "none",
  },

  // --- Sign-Up / Confirmation Errors ---
  UsernameExistsException: {
    title: "Account Exists",
    description:
      "An account with this email address already exists. Please try logging in instead.",
    recoveryAction: "redirect",
    recoveryPath: "/auth/login",
  },
  InvalidPasswordException: {
    title: "Invalid Password",
    description:
      "Your password does not meet the requirements. It must be at least 8 characters long and include letters, numbers, and special characters.",
    recoveryAction: "none",
  },
  CodeMismatchException: {
    title: "Invalid Code",
    description:
      "The confirmation code you entered is incorrect. Please check the code and try again.",
    recoveryAction: "none",
  },
  ExpiredCodeException: {
    title: "Code Expired",
    description: "The confirmation code has expired. Please request a new one.",
    recoveryAction: "none",
  },

  // --- General Errors ---
  NetworkError: {
    title: "Network Issue",
    description:
      "We couldn't connect to our servers. Please check your internet connection and try again.",
    recoveryAction: "retry",
  },
};

/**
 * Handles an authentication error by mapping it to a user-friendly format.
 * @param {any} error - The raw error object, typically from an Amplify call.
 * @returns {HandledError} A structured error object with a user-friendly message.
 */
const handleAuthError = (error: any): HandledError => {
  const errorCode = error.name || "UnknownError";
  const handledError = errorMap[errorCode] || {
    ...defaultError,
    description: error.message || defaultError.description,
  };

  return handledError;
};

export const errorHandlingService = {
  handleAuthError,
};
