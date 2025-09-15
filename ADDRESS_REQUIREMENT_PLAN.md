# Address Requirement for BUY ALL Button - Implementation Plan

## Overview
This document outlines the implementation plan to enforce address requirements for the BUY ALL button in the marketplace catalog. Users must add both shipping and billing addresses before they can use the BUY ALL functionality.

## Core Requirements
- BUY ALL button must be disabled if user hasn't added addresses
- Address popup sequence after buyer preferences completion
- Shipping and billing address collection (same forms as account page)
- Skip option with "Add Later" button
- Redux state management for address presence check only
- No full address storage in Redux (boolean check only)

## Architecture Overview

### Redux State Structure
```typescript
// New slice: addressSlice.ts
interface AddressState {
  hasAddress: boolean | null;  // null = unknown, true/false = determined
  isLoading: boolean;
  error: string | null;
  skipTimestamp?: number;      // when user skipped adding address 
}
```

### Data Flow
```
Buyer Preferences → Address Check → Address Popup → BUY ALL State
```

## Component Changes

### 1. BuyerPreferencePopup.tsx
**Location**: `src/features/buyer-preferences/components/BuyerPreferencePopup.tsx`

**Changes**:
- Add address check after successful preference submission
- Trigger address popup flow if `hasAddress !== true`
- Handle skip scenarios gracefully

**Implementation**:
```typescript
// After preference submission
const handlePreferenceComplete = async () => {
  await submitPreferences();
  const hasAddress = await checkAddressStatus();
  if (!hasAddress) {
    dispatch(openAddressPopup());
  }
};
```

### 2. CatalogDisplay.tsx
**Location**: `src/features/marketplace-catalog/components/CatalogDisplay.tsx`

**Changes**:
- Add Redux selector for address check
- Disable BUY ALL button based on `hasAddress`
- Add visual indicator for address requirement
- Implement tooltip for disabled state

**Implementation**:
```typescript
// Redux selector
const hasAddress = useSelector(selectHasAddress);

// Button state
<BUY_ALL_BUTTON 
  disabled={!hasAddress}
  tooltip={!hasAddress ? "Add your address to enable purchases" : ""}
/>
```

### 3. Account Page Integration
**Location**: `src/app/buyer/account/page.tsx`

**Changes**:
- Sync address changes to Redux store
- Update `hasAddress` when addresses are added/deleted
- Ensure consistency between account page and popup

## Address Popup Implementation

### Shipping Address Popup
**Component**: `AddressPopup.tsx` (new)
**Location**: `src/features/addresses/components/ShippingAddressPopup.tsx`

**Features**:
- Reuse existing shipping address form from account page
- API endpoint: `/api/addresses/shipping`
- "Save & Continue" → proceeds to billing
- "Add Later" → sets `hasAddress=false`, stores skip timestamp

### Billing Address Popup
**Component**: `AddressPopup.tsx` (new)
**Location**: `src/features/addresses/components/BillingAddressPopup.tsx`

**Features**:
- Reuse existing billing address form from account page
- API endpoint: `/api/addresses/billing`
- "Save" → sets `hasAddress=true`
- "Add Later" → sets `hasAddress=false`

## API Design

### Address Check API
```http
GET /api/user/has-address
Response: { hasAddress: boolean }
```

### Address Creation APIs
```http
POST /api/addresses/shipping
POST /api/addresses/billing
```

**Success Response**: Triggers Redux update
```typescript
dispatch(setHasAddress(true));
```

## File Structure Changes

```
src/
├── features/
│   ├── addresses/
│   │   ├── components/
│   │   │   ├── AddressPopup.tsx
│   │   │   ├── ShippingAddressForm.tsx
│   │   │   └── BillingAddressForm.tsx
│   │   ├── redux/
│   │   │   └── addressSlice.ts
│   │   ├── hooks/
│   │   │   ├── useAddressCheck.ts
│   │   │   └── useAddressFlow.ts
│   │   └── services/
│   │       └── addressService.ts
├── features/
│   └── buyer-preferences/
│       └── components/
│           └── BuyerPreferencePopup.tsx
└── features/
    └── marketplace-catalog/
        └── components/
            └── CatalogDisplay.tsx
```

## State Management

### Redux Actions
```typescript
// addressSlice.ts
const addressSlice = createSlice({
  name: 'address',
  initialState: {
    hasAddress: null,
    isLoading: false,
    error: null,
    skipTimestamp: null,
  },
  reducers: {
    setHasAddress: (state, action) => {
      state.hasAddress = action.payload;
    },
    setSkipTimestamp: (state, action) => {
      state.skipTimestamp = action.payload;
    },
    clearSkip: (state) => {
      state.skipTimestamp = null;
    },
  },
});
```

### Selectors
```typescript
// Selectors for components
export const selectHasAddress = (state) => state.address.hasAddress;
export const selectAddressLoading = (state) => state.address.isLoading;
export const selectSkipTimestamp = (state) => state.address.skipTimestamp;
```

## Error Handling & Edge Cases

### Network Failures
- Retry mechanism with exponential backoff
- Graceful degradation: allow purchases if check fails
- Offline capability: use localStorage as fallback

### State Sync Issues
- Re-check address status on page navigation
- Sync with account page changes
- Handle concurrent modifications

### Skip Scenarios
- Store skip timestamp to avoid immediate re-prompt
- Allow re-triggering from account settings
- Clear skip state after major app updates

### Race Conditions
- Debounce address checks
- Use optimistic updates with rollback
- Implement request IDs for idempotency

## User Experience Flow

```
1. Buyer completes preferences
2. System checks address status
3. If no address:
   - Show shipping popup
   - User can save or skip
   - If saved, show billing popup
   - User can save or skip
4. BUY ALL button state updates based on result
5. User can always add addresses later from account
```

## Performance Considerations

- Lazy load address components
- Debounce API calls
- Cache address check for session duration
- Minimize re-renders with proper memoization

## Security & Privacy

- Never store full address in Redux
- Use HTTPS for all API calls
- Sanitize user inputs
- Implement rate limiting for address checks

## Testing Strategy

### Unit Tests
- Redux state updates
- API call success/failure scenarios
- Skip button functionality

### Integration Tests
- Complete flow from preferences to BUY ALL
- State persistence across sessions
- Error recovery mechanisms

### E2E Tests
- Full user journey testing
- Network interruption handling
- Cross-browser compatibility

## Implementation Timeline

1. **Phase 1**: Redux state setup and API integration
2. **Phase 2**: Address popup components and flow
3. **Phase 3**: CatalogDisplay integration and testing
4. **Phase 4**: Error handling and edge cases
5. **Phase 5**: Performance optimization and final testing

## Dependencies

- Redux Toolkit for state management
- React Query for API calls
- React Hook Form for address forms
- Lucide React for icons
- Tailwind CSS for styling

## Notes
- Keep address forms consistent with account page
- Ensure mobile responsiveness for popups
- Maintain accessibility standards
- Document all API contracts clearly
