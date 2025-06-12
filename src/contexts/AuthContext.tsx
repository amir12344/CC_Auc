'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, fetchAuthSession, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import {
  loginWithAmplifyUser,
  logout,
  setLoading,
  setError,
  authCheckFailed,
  refreshAuth
} from '@/src/features/authentication/store/authSlice';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserProfile,
  selectAmplifyUser,
  selectUserType,
  selectAuthToken,
  selectIsSessionValid
} from '@/src/features/authentication/store/authSelectors';
import type { RootState } from '@/src/lib/store';
import type { AmplifyUser, UserProfile } from '@/src/lib/interfaces/auth';

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // User data
  user: AmplifyUser | null;
  userProfile: UserProfile | null;
  userType: 'buyer' | 'seller' | null;
  token: string | null;

  // Session management
  isSessionValid: boolean;

  // Actions
  signOutUser: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();

  // Redux state selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectAmplifyUser);
  const userProfile = useSelector(selectUserProfile);
  const userType = useSelector(selectUserType);
  const token = useSelector(selectAuthToken);
  const isSessionValid = useSelector(selectIsSessionValid);

  // Check authentication status with Amplify
  const checkAuthStatus = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      // Get current user from Amplify
      const currentUser = await getCurrentUser();

      // Get auth session for credentials and tokens
      const session = await fetchAuthSession();

      if (currentUser && session.credentials && session.tokens) {
        // Fetch user attributes to get custom data
        const attributes = await fetchUserAttributes();
        // Construct Amplify user object
        const amplifyUser: AmplifyUser = {
          userId: currentUser.userId,
          username: currentUser.username,
          email: attributes.email || '',
          identityId: session.identityId,
          attributes: {
            email: attributes.email || '',
            'custom:fullName': attributes['custom:fullName'],
            phone_number: attributes.phone_number,
            // Legacy fields for backward compatibility
            'custom:firstName': attributes['custom:firstName'] || '',
            'custom:lastName': attributes['custom:lastName'] || '',
            // New buyer fields
            'custom:jobTitle': attributes['custom:jobTitle'],
            'custom:companyName': attributes['custom:companyName'],
            // Shared fields
            'custom:userRole': attributes['custom:userRole'] as 'buyer' | 'seller',
            'custom:termsAccepted': attributes['custom:termsAccepted'] || 'false',
            'custom:hasCert': attributes['custom:hasCert'],
            'custom:certPaths': attributes['custom:certPaths'],
            'custom:certUploadDate': attributes['custom:certUploadDate'],
            'custom:certStatus': attributes['custom:certStatus'] as 'pending' | 'approved' | 'rejected',
          },
          signInDetails: currentUser.signInDetails ? {
            loginId: currentUser.signInDetails.loginId || '',
            authFlowType: currentUser.signInDetails.authFlowType || '',
          } : undefined
        };

        // Extract access token
        const accessToken = session.tokens.accessToken.toString();

        // Update Redux store
        dispatch(loginWithAmplifyUser({
          amplifyUser,
          token: accessToken
        }));
      } else {
        dispatch(authCheckFailed('Authentication incomplete'));
      }
    } catch (err: any) {
      // Don't treat "not authenticated" as an error
      if (err.name === 'UserUnAuthenticatedException' ||
        err.message?.includes('not authenticated') ||
        err.message?.includes('No current user')) {
        dispatch(authCheckFailed(null));
      } else {
        dispatch(authCheckFailed(err.message || 'Authentication check failed'));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Sign out user
  const signOutUser = async () => {
    try {
      dispatch(setLoading(true));

      await signOut();
      dispatch(logout());

    } catch (err: any) {
      dispatch(setError('Failed to sign out'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Refresh authentication state
  const refreshAuthStatus = async () => {
    await checkAuthStatus();
  };

  // Update user profile from Amplify
  const updateUserProfile = async () => {
    try {
      if (!isAuthenticated) {
        return;
      }

      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();

      if (user && session.tokens) {
        const updatedUser: AmplifyUser = {
          ...user,
          attributes: {
            ...user.attributes,
            ...attributes,
          }
        };

        const accessToken = session.tokens.accessToken.toString();

        dispatch(refreshAuth({
          amplifyUser: updatedUser,
          token: accessToken
        }));

      }
    } catch (err: any) {
      dispatch(setError('Failed to update user profile'));
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for auth state changes (optional - you can implement Hub listener here)
  useEffect(() => {
    // You can add Amplify Hub listener here to automatically sync auth state
    // For now, we'll rely on manual checks
  }, []);

  const value: AuthContextType = {
    // Authentication state
    isAuthenticated,
    isLoading,
    error,

    // User data
    user,
    userProfile,
    userType,
    token,

    // Session management
    isSessionValid,

    // Actions
    signOutUser,
    refreshAuth: refreshAuthStatus,
    checkAuthStatus,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 