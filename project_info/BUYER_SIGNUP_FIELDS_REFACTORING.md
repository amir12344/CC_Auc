# Buyer Signup Fields Refactoring Plan

## Overview
This document outlines the comprehensive plan to update the buyer signup form to only include the following fields:
- **Name** (replacing firstName + lastName)
- **Job Title** (new field)
- **Password** 
- **Company Name** (new field)
- **Phone#** (existing)
- **Email#** (existing)

## Current Implementation Analysis

### Current Fields (Buyer Signup)
1. firstName (required)
2. lastName (required) 
3. email (required)
4. password (required)
5. phoneNumber (optional)
6. referralSource (optional)
7. termsAccepted (required)

### Target Fields (New Requirements)
1. **name** (required) - single field replacing firstName/lastName
2. **jobTitle** (required) - new field
3. **email** (required) - existing
4. **password** (required) - existing
5. **companyName** (required) - new field
6. **phoneNumber** (required) - changing from optional to required
7. **termsAccepted** (required) - existing

## Key Challenges & Solutions

### 1. Amplify/Cognito Standard Attributes
**Challenge**: Cognito prefers standard attributes like `given_name` and `family_name` over a single `name` field.

**Solution**: 
- Use the standard `name` attribute in Cognito (maps to full name)
- Store the single "Name" value in both `name` and potentially create a custom attribute
- Remove dependency on `given_name` and `family_name`

### 2. Existing User Profile Logic
**Challenge**: Current Redux store and components expect `firstName` and `lastName` separately.

**Solution**:
- Update auth store to handle single `name` field
- Modify display logic to use full name instead of concatenating first/last
- Update avatar initial generation logic

## Implementation Plan

### Phase 1: Amplify Backend Updates
**Files to modify:**
- `amplify/auth/resource.ts`

**Changes:**
1. Add new custom attributes:
   - `custom:jobTitle`
   - `custom:companyName` 
2. Remove custom attributes:
   - `custom:firstName` 
   - `custom:lastName`
3. Ensure standard `name` attribute is configured
4. Update `phoneNumber` to be required

### Phase 2: Frontend Form Updates
**Files to modify:**
- `src/app/auth/buyer-signup/page.tsx`

**Changes:**
1. Update Zod validation schema:
   - Replace `firstName` + `lastName` with single `name` field
   - Add `jobTitle` validation 
   - Add `companyName` validation
   - Make `phoneNumber` required
   - Remove `referralSource` field
2. Update form UI:
   - Replace separate name fields with single "Name" input
   - Add "Job Title" input field
   - Add "Company Name" input field
   - Update phone number field to be required
   - Remove referral source field
3. Update signUp API call:
   - Map single name to standard `name` attribute
   - Add new custom attributes for jobTitle and companyName
   - Remove firstName/lastName custom attributes

### Phase 3: Authentication Store Updates
**Files to modify:**
- `src/features/authentication/store/authSlice.ts`
- `src/features/authentication/store/authSelectors.ts`

**Changes:**
1. Update user profile interface/types
2. Modify attribute extraction logic to use `name` instead of firstName/lastName
3. Update display name generation logic
4. Update avatar initials logic to work with full name

### Phase 4: Component Updates
**Files to check and potentially modify:**
- Any components displaying user names
- Profile/account settings pages
- User dropdowns/navigation

### Phase 5: Data Migration Considerations
**Important Note**: This change only affects NEW buyer signups. Existing users will retain their firstName/lastName attributes, and the system should gracefully handle both patterns.

## Detailed Implementation Tasks

### Task 1: Update Amplify Auth Resource
- [ ] Modify `amplify/auth/resource.ts`
  - [ ] Add `custom:jobTitle` attribute (String, mutable, required for new signups)
  - [ ] Add `custom:companyName` attribute (String, mutable, required for new signups) 
  - [ ] Remove `custom:firstName` and `custom:lastName` attributes
  - [ ] Ensure `name` standard attribute is properly configured
  - [ ] Update `phoneNumber` configuration if needed
  - [ ] Remove `custom:referralSource` attribute

### Task 2: Update Buyer Signup Form Schema
- [ ] Modify validation schema in `src/app/auth/buyer-signup/page.tsx`
  - [ ] Replace `firstName` and `lastName` with `name` field
  - [ ] Add `jobTitle` field validation (required, min 1 character)
  - [ ] Add `companyName` field validation (required, min 1 character)
  - [ ] Update `phoneNumber` to be required instead of optional
  - [ ] Remove `referralSource` field
  - [ ] Update TypeScript types

### Task 3: Update Buyer Signup Form UI
- [ ] Modify form UI in `src/app/auth/buyer-signup/page.tsx`
  - [ ] Replace firstName/lastName inputs with single "Name" input
  - [ ] Add "Job Title" input field with appropriate icon
  - [ ] Add "Company Name" input field with appropriate icon
  - [ ] Update phone number field styling/label to indicate it's required
  - [ ] Remove referral source dropdown
  - [ ] Update form grid layout as needed
  - [ ] Update field ordering for better UX

### Task 4: Update SignUp API Integration
- [ ] Modify signUp call in `src/app/auth/buyer-signup/page.tsx`
  - [ ] Map form data to correct Cognito attributes:
    - `name`: data.name (standard attribute)
    - `custom:jobTitle`: data.jobTitle
    - `custom:companyName`: data.companyName
    - `custom:userRole`: "buyer" (existing)
    - `phone_number`: formatted phone (existing)
    - `email`: data.email (existing)
  - [ ] Remove firstName/lastName custom attribute assignments
  - [ ] Remove referralSource assignment
  - [ ] Update error handling if needed

### Task 5: Update Authentication Store
- [ ] Modify `src/features/authentication/store/authSlice.ts`
  - [ ] Update user profile extraction to use `name` attribute
  - [ ] Add jobTitle and companyName to user profile
  - [ ] Handle backward compatibility for existing users with firstName/lastName
  - [ ] Update display name logic

- [ ] Modify `src/features/authentication/store/authSelectors.ts`
  - [ ] Update `getUserDisplayName` to use full name
  - [ ] Update `getUserInitials` to extract from full name
  - [ ] Handle edge cases for name parsing

### Task 6: Update TypeScript Types
- [ ] Update authentication types:
  - [ ] Add jobTitle and companyName to user profile interface
  - [ ] Remove firstName/lastName if they exist in types
  - [ ] Update any form types or interfaces

### Task 7: Test & Validate
- [ ] Test new buyer signup flow
  - [ ] Verify all fields are properly validated
  - [ ] Confirm data is correctly stored in Cognito
  - [ ] Test phone number formatting
  - [ ] Verify terms acceptance works
- [ ] Test authentication store
  - [ ] Verify user profile is correctly populated
  - [ ] Check display name generation
  - [ ] Test avatar initials generation
- [ ] Test backward compatibility
  - [ ] Ensure existing users still work
  - [ ] Verify mixed attribute scenarios

### Task 8: Update Documentation
- [ ] Update any relevant documentation
- [ ] Update API documentation if exists
- [ ] Update onboarding flow documentation

## Implementation Notes

### Cognito Attribute Mapping Strategy
```typescript
// New signup API call structure
const signUpResult = await signUp({
  username: data.email,
  password: data.password,
  options: {
    userAttributes: {
      email: data.email,
      name: data.name, // Standard attribute for full name
      phone_number: formattedPhoneNumber,
      "custom:jobTitle": data.jobTitle,
      "custom:companyName": data.companyName,
      "custom:userRole": "buyer",
      "custom:termsAccepted": data.termsAccepted.toString()
    },
    autoSignIn: true
  }
});
```

### Backward Compatibility Strategy
The authentication store should handle both patterns:
```typescript
// Handle both old and new name patterns
const getUserDisplayName = (attributes: any) => {
  // New pattern - single name field
  if (attributes.name) {
    return attributes.name;
  }
  
  // Old pattern - firstName + lastName
  const firstName = attributes['custom:firstName'] || attributes.given_name;
  const lastName = attributes['custom:lastName'] || attributes.family_name;
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName || lastName || 'User';
};
```

### Avatar Initials Logic
```typescript
const getInitialsFromFullName = (fullName: string) => {
  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  // Take first letter of first name and first letter of last word
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};
```

## Risk Assessment

### Low Risk
- Adding new custom attributes (jobTitle, companyName)
- Updating form validation and UI
- Making phone number required

### Medium Risk  
- Changing from firstName/lastName to single name field
- Updating authentication store logic
- Avatar initials generation changes

### High Risk
- Backward compatibility with existing users
- Potential issues with Cognito attribute limits
- Dependencies on firstName/lastName in other parts of the application

## Testing Strategy

### Unit Tests
- [ ] Form validation tests
- [ ] Authentication store tests
- [ ] Utility function tests (name parsing, initials)

### Integration Tests
- [ ] Full signup flow test
- [ ] Authentication flow test
- [ ] User profile display test

### Manual Testing
- [ ] New user signup
- [ ] Existing user login
- [ ] User profile display across app
- [ ] Mobile responsiveness
- [ ] Error handling scenarios

## Deployment Considerations

### Database Migration
No database migration needed as this only affects new signups.

### Rollback Plan
If issues arise:
1. Revert frontend changes
2. Keep new Amplify attributes (they won't break existing functionality)
3. Restore old form logic

### Monitoring
- Monitor signup success rates
- Watch for authentication errors
- Track user experience metrics

## Success Criteria

- [ ] New buyer signup form contains only the 6 required fields
- [ ] All form validation works correctly
- [ ] User data is properly stored in Cognito
- [ ] User profile displays correctly throughout the app
- [ ] Existing users continue to work without issues
- [ ] No degradation in signup conversion rates
- [ ] Mobile responsiveness maintained
- [ ] Accessibility standards maintained

## Timeline

**Estimated Duration**: 2-3 days

**Day 1**: 
- Phase 1 (Amplify updates) - 2 hours
- Phase 2 (Form updates) - 4 hours
- Phase 3 (Auth store updates) - 2 hours

**Day 2**:
- Phase 4 (Component updates) - 2 hours
- Testing and debugging - 4 hours
- Documentation updates - 2 hours

**Day 3** (if needed):
- Additional testing - 2 hours
- Bug fixes - 4 hours
- Final validation - 2 hours 