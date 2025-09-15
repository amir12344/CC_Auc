/**
 * @fileoverview This service encapsulates all authentication-related API calls to AWS Amplify.
 * It provides a clean, centralized interface for user authentication tasks like signing up,
 * signing in, confirming accounts, and managing sessions. This decouples the UI components
 * from the underlying Amplify implementation, improving maintainability and testability.
 */
import {
  autoSignIn as amplifyAutoSignIn,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser as amplifyGetCurrentUser,
  resendSignUpCode as amplifyResendSignUpCode,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  updateUserAttributes as amplifyUpdateUserAttributes,
  fetchAuthSession,
  type AuthSession,
  type AuthUser,
  type SignInOutput as AutoSignInOutput,
  type ConfirmSignUpInput,
  type ConfirmSignUpOutput,
  type ResendSignUpCodeInput,
  type ResendSignUpCodeOutput,
  type SignInInput,
  type SignInOutput,
  type SignUpInput,
  type SignUpOutput,
  type UpdateUserAttributesInput,
  type UpdateUserAttributesOutput,
} from "aws-amplify/auth";

/**
 * Wraps the Amplify signUp function to provide a consistent API for the app.
 * @param {SignUpInput} input - The user's sign-up information.
 * @returns {Promise<SignUpOutput>} The result of the sign-up operation.
 */
const signUp = (input: SignUpInput): Promise<SignUpOutput> => {
  return amplifySignUp(input);
};

/**
 * Wraps the Amplify confirmSignUp function.
 * @param {ConfirmSignUpInput} input - The confirmation code and username.
 * @returns {Promise<ConfirmSignUpOutput>} The result of the confirmation operation.
 */
const confirmSignUp = (
  input: ConfirmSignUpInput
): Promise<ConfirmSignUpOutput> => {
  return amplifyConfirmSignUp(input);
};

/**
 * Wraps the Amplify resendSignUpCode function.
 * @param {ResendSignUpCodeInput} input - The username to resend the code to.
 * @returns {Promise<ResendSignUpCodeOutput>} The result of the resend code operation.
 */
const resendSignUpCode = (
  input: ResendSignUpCodeInput
): Promise<ResendSignUpCodeOutput> => {
  return amplifyResendSignUpCode(input);
};

/**
 * Wraps the Amplify autoSignIn function.
 * @returns {Promise<AutoSignInOutput>} The result of the auto sign-in operation.
 */
const autoSignIn = (): Promise<AutoSignInOutput> => {
  return amplifyAutoSignIn();
};

/**
 * Wraps the Amplify signIn function.
 * @param {SignInInput} input - The user's sign-in credentials.
 * @returns {Promise<SignInOutput>} The result of the sign-in operation.
 */
const signIn = (input: SignInInput): Promise<SignInOutput> => {
  return amplifySignIn(input);
};

/**
 * Wraps the Amplify signOut function with enhanced error handling.
 * @returns {Promise<void>}
 */
const signOut = async (): Promise<void> => {
  try {
    await amplifySignOut();
  } catch (err) {
    const error = err as Error;
    // Gracefully handle various Auth configuration errors
    if (
      error?.name === "AuthUserPoolException" ||
      error?.name === "NotConfigured" ||
      /UserPool not configured/i.test(error?.message || "") ||
      /Auth is not configured/i.test(error?.message || "") ||
      /Amplify has not been configured/i.test(error?.message || "")
    ) {
      // Clear any local storage or session data manually
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // Ignore storage clearing errors
        }
      }
      return;
    }
    throw error;
  }
};

/**
 * Wraps the Amplify getCurrentUser function.
 * @returns {Promise<AuthUser>} The current authenticated user.
 */
const getCurrentUser = (): Promise<AuthUser> => {
  return amplifyGetCurrentUser();
};

/**
 * Wraps the Amplify fetchAuthSession function.
 * @returns {Promise<AuthSession>} The current auth session.
 */
const getSession = (): Promise<AuthSession> => {
  return fetchAuthSession();
};

/**
 * Wraps the Amplify updateUserAttributes function.
 * @param {UpdateUserAttributesInput} input - The attributes to update.
 * @returns {Promise<UpdateUserAttributesOutput>} The result of the update operation.
 */
const updateUserAttributes = (
  input: UpdateUserAttributesInput
): Promise<UpdateUserAttributesOutput> => {
  return amplifyUpdateUserAttributes(input);
};

export const authService = {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  autoSignIn,
  signIn,
  signOut,
  getCurrentUser,
  updateUserAttributes,
  getSession,
};
