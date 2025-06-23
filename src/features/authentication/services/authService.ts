/**
 * @fileoverview This service encapsulates all authentication-related API calls to AWS Amplify.
 * It provides a clean, centralized interface for user authentication tasks like signing up,
 * signing in, confirming accounts, and managing sessions. This decouples the UI components
 * from the underlying Amplify implementation, improving maintainability and testability.
 */

import {
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  autoSignIn as amplifyAutoSignIn,
  resendSignUpCode as amplifyResendSignUpCode,
  getCurrentUser as amplifyGetCurrentUser,
  updateUserAttributes as amplifyUpdateUserAttributes,
  fetchAuthSession
} from 'aws-amplify/auth';

import type {
  SignUpInput,
  SignUpOutput,
  SignInInput,
  SignInOutput,
  ConfirmSignUpInput,
  ResendSignUpCodeInput,
  UpdateUserAttributesInput,
  ConfirmSignUpOutput,
  ResendSignUpCodeOutput,
  SignInOutput as AutoSignInOutput,
  AuthUser,
  AuthSession,
  UpdateUserAttributesOutput
} from 'aws-amplify/auth';

/**
 * Wraps the Amplify signUp function to provide a consistent API for the app.
 * @param {SignUpInput} input - The user's sign-up information.
 * @returns {Promise<SignUpOutput>} The result of the sign-up operation.
 */
const signUp = async (input: SignUpInput): Promise<SignUpOutput> => {
  try {
    console.log('[Analytics] Auth Event: signUp_attempt', { username: input.username });
    const result = await amplifySignUp(input);
    console.log('[Analytics] Auth Event: signUp_success', { userId: result.userId });
    return result;
  } catch (error) {
    console.error('[Analytics] Auth Event: signUp_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify confirmSignUp function.
 * @param {ConfirmSignUpInput} input - The confirmation code and username.
 * @returns {Promise<ConfirmSignUpOutput>} The result of the confirmation operation.
 */
const confirmSignUp = async (input: ConfirmSignUpInput): Promise<ConfirmSignUpOutput> => {
  try {
    console.log('[Analytics] Auth Event: confirmSignUp_attempt', { username: input.username });
    const result = await amplifyConfirmSignUp(input);
    console.log('[Analytics] Auth Event: confirmSignUp_success', { username: input.username });
    return result;
  } catch (error) {
    console.error('[Analytics] Auth Event: confirmSignUp_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify resendSignUpCode function.
 * @param {ResendSignUpCodeInput} input - The username to resend the code to.
 * @returns {Promise<ResendSignUpCodeOutput>} The result of the resend code operation.
 */
const resendSignUpCode = async (input: ResendSignUpCodeInput): Promise<ResendSignUpCodeOutput> => {
  try {
    console.log('[Analytics] Auth Event: resendSignUpCode_attempt', { username: input.username });
    const result = await amplifyResendSignUpCode(input);
    console.log('[Analytics] Auth Event: resendSignUpCode_success', { username: input.username });
    return result;
  } catch (error) {
    console.error('[Analytics] Auth Event: resendSignUpCode_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify autoSignIn function.
 * @returns {Promise<AutoSignInOutput>} The result of the auto sign-in operation.
 */
const autoSignIn = async (): Promise<AutoSignInOutput> => {
  try {
    console.log('[Analytics] Auth Event: autoSignIn_attempt');
    const result = await amplifyAutoSignIn();
    console.log('[Analytics] Auth Event: autoSignIn_success');
    return result;
  } catch (error) {
    console.error('[Analytics] Auth Event: autoSignIn_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify signIn function.
 * @param {SignInInput} input - The user's sign-in credentials.
 * @returns {Promise<SignInOutput>} The result of the sign-in operation.
 */
const signIn = async (input: SignInInput): Promise<SignInOutput> => {
  try {
    console.log('[Analytics] Auth Event: signIn_attempt', { username: input.username });
    const result = await amplifySignIn(input);
    console.log('[Analytics] Auth Event: signIn_success');
    return result;
  } catch (error) {
    console.error('[Analytics] Auth Event: signIn_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify signOut function.
 * @returns {Promise<void>}
 */
const signOut = async (): Promise<void> => {
  try {
    console.log('[Analytics] Auth Event: signOut_attempt');
    await amplifySignOut();
    console.log('[Analytics] Auth Event: signOut_success');
  } catch (error) {
    console.error('[Analytics] Auth Event: signOut_failure', { error });
    throw error;
  }
};

/**
 * Wraps the Amplify getCurrentUser function.
 * @returns {Promise<AuthUser>} The current authenticated user.
 */
const getCurrentUser = async (): Promise<AuthUser> => {
  try {
    const user = await amplifyGetCurrentUser();
    console.log('AuthService: Fetched current user', user);
    return user;
  } catch (error) {
    console.error('AuthService: Error fetching current user:', error);
    throw error;
  }
};

/**
 * Wraps the Amplify fetchAuthSession function.
 * @returns {Promise<AuthSession>} The current auth session.
 */
const getSession = async (): Promise<AuthSession> => {
  try {
    const session = await fetchAuthSession();
    console.log('AuthService: Fetched auth session');
    return session;
  } catch (error) {
    console.error('AuthService: Error fetching auth session:', error);
    throw error;
  }
};

/**
 * Wraps the Amplify updateUserAttributes function.
 * @param {UpdateUserAttributesInput} input - The attributes to update.
 * @returns {Promise<UpdateUserAttributesOutput>} The result of the update operation.
 */
const updateUserAttributes = async (input: UpdateUserAttributesInput): Promise<UpdateUserAttributesOutput> => {
  try {
    const result = await amplifyUpdateUserAttributes(input);
    console.log('AuthService: Updated user attributes successfully');
    return result;
  } catch (error) {
    console.error('AuthService: Error updating user attributes:', error);
    throw error;
  }
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