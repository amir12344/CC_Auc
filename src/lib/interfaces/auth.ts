// Updated Auth interfaces for Amplify Gen 2 integration
export interface AuthToken {
  userType: "buyer" | "seller" | null;
  token: string;
}

// User verification status interface
export interface UserVerificationStatus {
  verification_status: "pending" | "approved" | "rejected" | null;
  account_locked: boolean;
  user_id: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userType: "buyer" | "seller" | null;
  token: string | null;
  user: AmplifyUser | null;
  isLoading: boolean;
  error: string | null;
  verificationStatus: string | null;
  accountLocked: boolean;
}

// Amplify User interface matching your custom attributes
export interface AmplifyUser {
  userId: string;
  username: string;
  email: string;
  identityId?: string;
  attributes: {
    email: string;
    phone_number?: string;
    // Standard Cognito attributes
    given_name?: string;
    family_name?: string;
    // Custom full name attribute
    "custom:fullName"?: string;
    // Custom attributes (legacy - for backward compatibility)
    "custom:firstName": string;
    "custom:lastName": string;
    // New buyer-specific attributes
    "custom:jobTitle"?: string;
    "custom:companyName"?: string;
    // Shared attributes
    "custom:userRole": "buyer" | "seller";
    "custom:termsAccepted": string;
  };
  signInDetails?: {
    loginId: string;
    authFlowType: string;
  };
}

// Computed user profile from Amplify attributes
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: "buyer" | "seller";
  phoneNumber?: string;
  // New buyer profile fields
  jobTitle?: string;
  companyName?: string;
  termsAccepted: boolean;
  // Verification status fields
  verificationStatus?: string | null;
  accountLocked?: boolean;
  // Timestamps
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: "buyer" | "seller";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  userType?: "buyer" | "seller";
  error?: string;
}

// Session management types
export interface SessionData {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  verificationStatus: string | null;
  accountLocked: boolean;
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ("buyer" | "seller")[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}
