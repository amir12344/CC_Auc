import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/src/lib/store';
import { UserProfile } from '@/src/lib/interfaces/auth';

// Basic auth selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUserType = (state: RootState) => state.auth.userType;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Amplify user selectors
export const selectAmplifyUser = (state: RootState) => state.auth.user;
export const selectUserAttributes = (state: RootState) => state.auth.user?.attributes;

// Computed user profile selector with proper memoization
export const selectUserProfile = createSelector(
  [(state: RootState) => state.auth.user],
  (user): UserProfile | null => {
    if (!user || !user.attributes) {
      return null;
    }
    
    const { attributes } = user;
    
    // Handle name logic with backward compatibility (matching auth slice logic)
    let firstName = '';
    let lastName = '';
    let fullName = '';
    
            // New pattern - use the custom 'fullName' attribute first
  if (attributes['custom:fullName']) {
    fullName = attributes['custom:fullName'];
      // Extract firstName/lastName from full name for backward compatibility
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }
    } else {
      // Old pattern - use custom attributes or standard attributes
      firstName = attributes['custom:firstName'] || attributes.given_name || '';
      lastName = attributes['custom:lastName'] || attributes.family_name || '';
      fullName = `${firstName} ${lastName}`.trim();
    }

    // Create profile object - memoized so it won't create new objects unless user data changes
    const profile: UserProfile = {
      id: user.userId,
      username: user.username,
      email: attributes.email,
      firstName,
      lastName,
      fullName,
      userType: attributes['custom:userRole'] as 'buyer' | 'seller',
      phoneNumber: attributes.phone_number,
      // New buyer fields
      jobTitle: attributes['custom:jobTitle'],
      companyName: attributes['custom:companyName'],
      termsAccepted: attributes['custom:termsAccepted'] === 'true',
      // Seller-specific fields
      hasResellerCertificate: attributes['custom:hasCert'] === 'true',
      certificateStatus: attributes['custom:certStatus'] as 'pending' | 'approved' | 'rejected' | undefined,
      certificateUploadDate: attributes['custom:certUploadDate'] ? new Date(attributes['custom:certUploadDate']) : undefined,
      // Timestamps - using consistent dates to ensure referential equality
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      lastLoginAt: new Date('2024-01-01T00:00:00.000Z'),
    };
    
    return profile;
  }
);

// Convenience selectors for user information with memoization
export const selectUserDisplayName = createSelector(
  [selectUserProfile],
  (profile) => profile?.fullName || profile?.username || profile?.email || 'User'
);

export const selectUserInitials = createSelector(
  [selectUserProfile],
  (profile) => {
    let initials = 'U';
    
    if (profile) {
      const firstName = profile.firstName?.trim();
      const lastName = profile.lastName?.trim();
      
      if (firstName && lastName) {
        initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
      } else if (firstName) {
        initials = firstName.charAt(0).toUpperCase();
      } else if (lastName) {
        initials = lastName.charAt(0).toUpperCase();
      } else if (profile.fullName && profile.fullName.trim()) {
        // Try to extract initials from fullName if firstName/lastName are empty
        const nameParts = profile.fullName.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          initials = `${nameParts[0].charAt(0).toUpperCase()}${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}`;
        } else if (nameParts.length === 1) {
          initials = nameParts[0].charAt(0).toUpperCase();
        }
      } else if (profile.username && profile.username.trim()) {
        // Try to extract from username if it looks like a name
        const usernameParts = profile.username.trim().split(/[._-]/);
        if (usernameParts.length >= 2) {
          initials = `${usernameParts[0].charAt(0).toUpperCase()}${usernameParts[1].charAt(0).toUpperCase()}`;
        } else {
          initials = profile.username.charAt(0).toUpperCase();
        }
      } else if (profile.email) {
        // Extract from email as last resort
        const emailPart = profile.email.split('@')[0];
        const emailParts = emailPart.split(/[._-]/);
        if (emailParts.length >= 2) {
          initials = `${emailParts[0].charAt(0).toUpperCase()}${emailParts[1].charAt(0).toUpperCase()}`;
        } else {
          initials = profile.email.charAt(0).toUpperCase();
        }
      }
    }
    
    return initials;
  }
);

// Role-based selectors
export const selectIsBuyer = (state: RootState) => selectUserType(state) === 'buyer';
export const selectIsSeller = (state: RootState) => selectUserType(state) === 'seller';

// Seller-specific selectors
export const selectSellerCertificateStatus = (state: RootState) => {
  const profile = selectUserProfile(state);
  return profile?.certificateStatus;
};

export const selectHasResellerCertificate = (state: RootState) => {
  const profile = selectUserProfile(state);
  return profile?.hasResellerCertificate === true;
};

// Authentication state selectors
export const selectCanAccessBuyerRoutes = (state: RootState) => {
  return selectIsAuthenticated(state) && selectIsBuyer(state);
};

export const selectCanAccessSellerRoutes = (state: RootState) => {
  return selectIsAuthenticated(state) && selectIsSeller(state);
};

// Auth loading and error state helpers
export const selectAuthState = (state: RootState) => ({
  isAuthenticated: selectIsAuthenticated(state),
  isLoading: selectAuthLoading(state),
  error: selectAuthError(state),
  userType: selectUserType(state),
});

// Session validation selectors
export const selectIsSessionValid = (state: RootState) => {
  return selectIsAuthenticated(state) && selectAmplifyUser(state) !== null;
};

// Combined selectors
export const selectAuthInfo = (state: RootState) => ({
  isAuthenticated: selectIsAuthenticated(state),
  userType: selectUserType(state),
  token: selectAuthToken(state),
}); 