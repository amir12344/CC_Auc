# Create Order Implementation Plan

## Overview

Implement the Create Order functionality in `CreateOrderSheet.tsx` component that allows sellers to modify buyer offers and create orders using the `modifyAndAcceptCatalogOffer` API mutation.

## Requirements Analysis

### API Structure

```typescript
const { data: result, errors: errors } = await client.queries.modifyAndAcceptCatalogOffer({
  offerPublicId: string,                    // From fetchSellerOffers() → id field
  sellerMessage: string,                    // Optional, can be empty
  autoCreateOrder: true,                    // Always true
  shippingAddressPublicId: string,          // From fetchSellerOffers() → shippingAddressPublicId
  billingAddressPublicId: string,           // From fetchSellerOffers() → billingAddressPublicId
  orderNotes: string,                       // Optional, can be empty
  modifications: [
    {
      action: "UPDATE_EXISTING" | "ADD_PRODUCT" | "REMOVE_PRODUCT", // Based on user actions
      catalogOfferItemPublicId: string,     // From fetchOrderItemsByOfferId → catalogOfferItemPublicId
      catalogProductVariantPublicId: string, // From fetchOrderItemsByOfferId → variantId
      quantity: number,                     // Original → requestedQuantity
      sellerPricePerUnit: number,           // Original → buyerOfferPrice
      newQuantity: number,                  // Updated quantity
      newSellerPricePerUnit: number,        // Updated price
      modificationReason: string,           // Optional, can be empty
    }
  ]
});
```

### Data Flow

#### Current Data Sources

1. **CreateOrderSheet Props**:
   - `catalogOfferId`: Used to fetch buyer items
   - `catalogListingPublicId`: Used to fetch available variants
   - Need to pass `offerPublicId` from parent component

2. **fetchSellerOffers()** provides:
   - `id` → `offerPublicId`
   - `shippingAddressPublicId`
   - `billingAddressPublicId`

3. **fetchOrderItemsByOfferId()** provides:
   - `catalogOfferItemPublicId`
   - `variantId` → `catalogProductVariantPublicId`
   - `requestedQuantity` → `quantity`
   - `buyerOfferPrice` → `sellerPricePerUnit`

4. **Current CreateOrderSheet state**:
   - `orderItems`: Array of `EnhancedSellerOrderItem`
   - Contains both buyer selections and seller additions
   - Tracks quantity/price modifications

## Implementation Plan

### Phase 1: Type Definitions and API Integration ✅ COMPLETED

#### 1.1 Extend Type Definitions ✅ COMPLETED
**File**: `src/features/seller-deals/types/index.ts`

**Changes Made:**
- Added `ModificationItem` interface for individual order modifications
- Added `CreateOrderPayload` interface for API call structure
- Added `CreateOrderResponse` interface for API response handling
- All types include proper TypeScript definitions for required and optional fields

#### 1.2 Add API Service Method ✅ COMPLETED
**File**: `src/features/seller-deals/services/sellerQueryService.ts`

**Changes Made:**
- Imported `formatBackendError` from `@/src/utils/error-utils`
- Added imports for new `CreateOrderPayload` and `CreateOrderResponse` types
- Implemented `createOrderFromOffer()` function that:
  - Calls `client.queries.modifyAndAcceptCatalogOffer` with proper payload structure
  - Handles all error scenarios using `formatBackendError` (no empty catch blocks)
  - Returns structured response with success/error states
  - Follows the same error handling pattern as AuctionBiddingArea.tsx

## Phase 2: Component Props and State Management

#### 2.1 Update CreateOrderSheet Props ⏳ IN PROGRESS
**File**: `src/features/seller-deals/components/CreateOrderSheet.tsx`

```typescript
// API payload types
export interface ModificationItem {
  action: 'UPDATE_EXISTING' | 'ADD_PRODUCT' | 'REMOVE_PRODUCT';
  catalogOfferItemPublicId: string;
  catalogProductVariantPublicId: string;
  quantity: number;
  sellerPricePerUnit: number;
  newQuantity: number;
  newSellerPricePerUnit: number;
  modificationReason?: string;
}

export interface CreateOrderPayload {
  offerPublicId: string;
  sellerMessage?: string;
  autoCreateOrder: boolean;
  shippingAddressPublicId: string;
  billingAddressPublicId: string;
  orderNotes?: string;
  modifications: ModificationItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  errors?: string[];
}
```

#### 1.2 Add API Service Method
**File**: `src/features/seller-deals/services/sellerQueryService.ts`

```typescript
// Add to exports
export const createOrderFromOffer = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const client = generateClient<Schema>();
    
    const { data: result, errors } = await client.queries.modifyAndAcceptCatalogOffer({
      offerPublicId: payload.offerPublicId,
      sellerMessage: payload.sellerMessage || '',
      autoCreateOrder: payload.autoCreateOrder,
      shippingAddressPublicId: payload.shippingAddressPublicId,
      billingAddressPublicId: payload.billingAddressPublicId,
      orderNotes: payload.orderNotes || '',
      modifications: payload.modifications,
    });

    if (errors) {
      return {
        success: false,
        errors: errors.map(error => error.message),
      };
    }

    return {
      success: true,
      orderId: result?.orderId,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
};
```

### Phase 2: Component Props and State Management

#### 2.1 Update CreateOrderSheet Props
**File**: `src/features/seller-deals/components/CreateOrderSheet.tsx`

```typescript
interface CreateOrderSheetProps {
  open: boolean;
  catalogOfferId: string;
  catalogListingPublicId: string;
  offerPublicId: string;                    // NEW: Required for API call
  shippingAddressPublicId: string;          // NEW: Required for API call
  billingAddressPublicId: string;           // NEW: Required for API call
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void; // NEW: Success callback
}
```

#### 2.2 Add Form State for Optional Fields
```typescript
// Add to CreateOrderSheet component state
const [sellerMessage, setSellerMessage] = useState<string>('');
const [orderNotes, setOrderNotes] = useState<string>('');
const [modificationReasons, setModificationReasons] = useState<{ [itemId: string]: string }>({});
```

### Phase 3: Modification Logic Implementation

#### 3.1 Track Item Changes
Need to implement logic to determine `action` type for each modification:

```typescript
const determineModificationAction = (item: EnhancedSellerOrderItem, originalItems: SellerOrderItem[]): 'UPDATE_EXISTING' | 'ADD_PRODUCT' | 'REMOVE_PRODUCT' => {
  // If item was added by seller
  if (item.isSellerAddition) {
    return 'ADD_PRODUCT';
  }
  
  // Find original item
  const originalItem = originalItems.find(orig => orig.catalogOfferItemPublicId === item.catalogOfferItemPublicId);
  
  if (!originalItem) {
    return 'ADD_PRODUCT'; // Shouldn't happen but safe fallback
  }
  
  // Check if quantity or price changed
  const quantityChanged = item.requestedQuantity !== originalItem.requestedQuantity;
  const priceChanged = Math.abs(item.buyerOfferPrice - originalItem.buyerOfferPrice) > 0.01;
  
  if (quantityChanged || priceChanged) {
    return 'UPDATE_EXISTING';
  }
  
  // If no changes, we can optionally exclude from modifications array
  return 'UPDATE_EXISTING';
};
```

#### 3.2 Build Modifications Array
```typescript
const buildModificationsArray = (): ModificationItem[] => {
  const modifications: ModificationItem[] = [];
  
  // Handle removed items (items in buyerItems but not in orderItems)
  buyerItems.forEach(originalItem => {
    const stillExists = orderItems.find(item => 
      item.catalogOfferItemPublicId === originalItem.catalogOfferItemPublicId
    );
    
    if (!stillExists) {
      modifications.push({
        action: 'REMOVE_PRODUCT',
        catalogOfferItemPublicId: originalItem.catalogOfferItemPublicId,
        catalogProductVariantPublicId: originalItem.variantId,
        quantity: originalItem.requestedQuantity,
        sellerPricePerUnit: originalItem.buyerOfferPrice,
        newQuantity: 0,
        newSellerPricePerUnit: 0,
        modificationReason: modificationReasons[originalItem.catalogOfferItemPublicId] || '',
      });
    }
  });
  
  // Handle existing and new items
  orderItems.forEach(item => {
    const action = determineModificationAction(item, buyerItems);
    const originalItem = buyerItems.find(orig => 
      orig.catalogOfferItemPublicId === item.catalogOfferItemPublicId
    );
    
    modifications.push({
      action,
      catalogOfferItemPublicId: item.catalogOfferItemPublicId,
      catalogProductVariantPublicId: item.variantId,
      quantity: originalItem?.requestedQuantity || 0,
      sellerPricePerUnit: originalItem?.buyerOfferPrice || 0,
      newQuantity: item.requestedQuantity,
      newSellerPricePerUnit: item.buyerOfferPrice,
      modificationReason: modificationReasons[item.id] || '',
    });
  });
  
  return modifications;
};
```

### Phase 4: UI Enhancements

#### 4.1 Add Optional Message Fields
Add form fields for:
- Seller Message (textarea)
- Order Notes (textarea)
- Modification Reasons (per-item input fields)

#### 4.2 Enhanced Submit Handler
```typescript
const handleCreateOrder = async () => {
  setIsSubmitting(true);
  
  try {
    const modifications = buildModificationsArray();
    
    const payload: CreateOrderPayload = {
      offerPublicId,
      sellerMessage,
      autoCreateOrder: true,
      shippingAddressPublicId,
      billingAddressPublicId,
      orderNotes,
      modifications,
    };
    
    const response = await createOrderFromOffer(payload);
    
    if (response.success) {
      // Show success toast
      toast({
        title: "Order Created Successfully",
        description: `Order ${response.orderId} has been created.`,
      });
      
      onOrderCreated?.(response.orderId!);
      onClose();
    } else {
      // Show error toast
      toast({
        title: "Failed to Create Order",
        description: response.errors?.join(', ') || "Unknown error occurred",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Failed to Create Order",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Phase 5: Parent Component Integration

#### 5.1 Update AllOffers Component
**File**: `src/features/seller-deals/components/AllOffers.tsx`

```typescript
// Add state to store offer details needed for CreateOrderSheet
const [selectedOfferData, setSelectedOfferData] = useState<{
  offerPublicId: string;
  shippingAddressPublicId: string;
  billingAddressPublicId: string;
} | null>(null);

// Update the "Create Order" button click handler
const handleCreateOrderClick = (offer: SellerOffer) => {
  setSelectedOfferData({
    offerPublicId: offer.id,
    shippingAddressPublicId: offer.shippingAddressPublicId!,
    billingAddressPublicId: offer.billingAddressPublicId!,
  });
  setSelectedOfferId(offer.catalog_offer_id);
  setSelectedCatalogListingPublicId(offer.catalogListingPublicId);
  setIsCreateOrderSheetOpen(true);
};

// Update CreateOrderSheet props
<CreateOrderSheet
  open={isCreateOrderSheetOpen}
  catalogOfferId={selectedOfferId}
  catalogListingPublicId={selectedCatalogListingPublicId}
  offerPublicId={selectedOfferData?.offerPublicId || ''}
  shippingAddressPublicId={selectedOfferData?.shippingAddressPublicId || ''}
  billingAddressPublicId={selectedOfferData?.billingAddressPublicId || ''}
  onClose={() => setIsCreateOrderSheetOpen(false)}
  onOrderCreated={(orderId) => {
    // Optionally refresh offers list or navigate
    console.log('Order created:', orderId);
  }}
/>
```

## Testing Strategy

### Unit Tests
1. Test `buildModificationsArray()` logic with various scenarios:
   - No changes (should include items or exclude based on business rules)
   - Quantity changes only
   - Price changes only
   - Both quantity and price changes
   - Seller additions
   - Removed items

2. Test `determineModificationAction()` logic

### Integration Tests
1. Test full create order flow with mock API responses
2. Test error handling scenarios
3. Test UI state management during submission

### Manual Testing Scenarios
1. **No Modifications**: Seller accepts offer as-is
2. **Update Existing**: Seller modifies quantities/prices
3. **Add Products**: Seller adds new variants
4. **Remove Products**: Seller removes buyer-selected items
5. **Mixed Operations**: Combination of all above
6. **Error Scenarios**: API failures, validation errors

## Risk Analysis

### Potential Issues
1. **Data Consistency**: Ensuring catalog IDs are correctly mapped between different API responses
2. **Floating Point Precision**: Price comparisons may need tolerance for floating point errors
3. **State Management**: Complex state with original vs modified items
4. **Error Handling**: Partial failures in modifications array

### Mitigation Strategies
1. Add extensive validation before API calls
2. Use precise decimal libraries for price calculations if needed
3. Implement comprehensive error logging
4. Add confirmation dialogs for destructive actions

## Success Criteria

### Functional Requirements
- [ ] Seller can create orders from buyer offers
- [ ] All modification types work correctly (UPDATE_EXISTING, ADD_PRODUCT, REMOVE_PRODUCT)
- [ ] Optional fields (messages, notes, reasons) are properly handled
- [ ] Error handling provides clear feedback
- [ ] Success flow redirects appropriately

### Non-Functional Requirements
- [ ] Form validation prevents invalid submissions
- [ ] Loading states provide good UX during API calls
- [ ] Performance is acceptable for large modification arrays
- [ ] Mobile responsiveness maintained

## Implementation Timeline

1. **Phase 1** (Day 1): Type definitions and API service method
2. **Phase 2** (Day 2): Component props and state management updates
3. **Phase 3** (Day 2-3): Modification logic implementation
4. **Phase 4** (Day 3): UI enhancements and form fields
5. **Phase 5** (Day 4): Parent component integration
6. **Testing** (Day 4-5): Comprehensive testing and bug fixes

## Phase 6: Take All Functionality Implementation

### 6.1 Requirements for Take All Feature

**Key Requirements:**
1. **Take All should NOT add items to the UI list** - it should not modify the current `orderItems` state
2. **Take All should directly call the API** with all variants from `fetchCatalogListingsVariantsForCreateOrder`
3. **API format should match modifyAndAcceptCatalogOffer structure** with specific modifications:
   - `action`: Always "ADD_PRODUCT" (since these are new items being added)
   - `catalogOfferItemPublicId`: Leave blank/empty for seller additions
   - `catalogProductVariantPublicId`: Use the variant public_id from the API response
   - `quantity`: Set to 0 (original seller quantity)
   - `sellerPricePerUnit`: Set to 0 (original seller price)
   - `newQuantity`: Use available_quantity from variants API
   - `newSellerPricePerUnit`: Use offer_price from variants API
   - `modificationReason`: Empty string

### 6.2 Update fetchCatalogListingsVariantsForCreateOrder Response

**File**: `src/features/seller-deals/services/sellerQueryService.ts`

**Current Response Structure:**
```typescript
interface CatalogListingVariant {
  public_id: string;
  title: string;
  available_quantity: number;
  retail_price: number;
  offer_price: number;
  variant_name: string;
  variant_sku: string;
  identifier: string;
  identifier_type: string;
  imageUrl: string | null;
  productTitle: string;
}
```

**Required for Take All:**
- The response already contains all needed fields
- No modification needed to the query structure
- The transformation function already provides the correct data format

### 6.3 Implement Take All Handler

**File**: `src/features/seller-deals/components/CreateOrderSheet.tsx`

```typescript
const handleTakeAll = useCallback(async () => {
  console.log('\n🔄 TAKE ALL - Starting process');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  setIsSubmitting(true);
  
  try {
    // Build modifications array from all available variants
    const takeAllModifications: ModificationItem[] = availableVariants.map(variant => ({
      action: 'ADD_PRODUCT',
      catalogOfferItemPublicId: '', // Empty for seller additions
      catalogProductVariantPublicId: variant.public_id,
      quantity: 0, // Original seller quantity
      sellerPricePerUnit: 0, // Original seller price
      newQuantity: variant.available_quantity,
      newSellerPricePerUnit: variant.offer_price,
      modificationReason: '',
    }));
    
    console.log('📦 TAKE ALL MODIFICATIONS:', takeAllModifications);
    
    const payload: CreateOrderPayload = {
      offerPublicId,
      sellerMessage: '',
      autoCreateOrder: true,
      shippingAddressPublicId,
      billingAddressPublicId,
      orderNotes: '',
      modifications: takeAllModifications,
    };
    
    const response = await createOrderFromOffer(payload);
    
    if (response.success) {
      console.log('✅ TAKE ALL SUCCESS:', response.orderId);
      onOrderCreated?.(response.orderId || '');
      onClose();
    } else {
      console.error('❌ TAKE ALL FAILED:', response.errors);
      setErrorMessage(response.errors?.[0] || 'Failed to create order');
      setErrorOpen(true);
    }
  } catch (error) {
    console.error('💥 TAKE ALL ERROR:', error);
    setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    setErrorOpen(true);
  } finally {
    setIsSubmitting(false);
  }
}, [availableVariants, offerPublicId, shippingAddressPublicId, billingAddressPublicId, onOrderCreated, onClose]);
```

### 6.4 Update Button Disabled State

**File**: `src/features/seller-deals/components/CreateOrderSheet.tsx`

```typescript
// Update the Take All button:
<button
  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
  disabled={availableVariants.length === 0 || isSubmitting}
  onClick={handleTakeAll}
  type="button"
>
  {isSubmitting ? (
    <span className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      Processing...
    </span>
  ) : (
    'Take All'
  )}
</button>
```

### 6.5 Key Implementation Notes

1. **No UI State Changes**: The Take All function should NOT modify `orderItems` state
2. **Direct API Call**: It should directly call `createOrderFromOffer` with all variants
3. **Error Handling**: Use the same error handling pattern as regular create order
4. **Loading States**: Show loading state during API call
5. **Success Flow**: Close modal and trigger `onOrderCreated` callback on success

### 6.6 Testing Strategy for Take All

1. **Unit Tests**:
   - Test modifications array generation from variants
   - Test API payload structure
   - Test error handling scenarios

2. **Integration Tests**:
   - Test full Take All flow with mock API responses
   - Test with empty variants list
   - Test concurrent Take All and regular create order

3. **Manual Testing**:
   - Verify no UI changes occur when Take All is clicked
   - Verify API is called with correct payload structure
   - Verify success/error flows work correctly

## Next Steps

1. Implement the `handleTakeAll` function in CreateOrderSheet.tsx
2. Update the Take All button to handle loading states
3. Test the functionality without breaking existing Create Order flow
4. Verify API payload structure matches requirements
5. Ensure seller added items don't have `catalogOfferItemPublicId`


/// how this work works

/*
====================================================================================
                      CREATE ORDER & TAKE ALL FUNCTIONALITY
                           COMPREHENSIVE DOCUMENTATION
====================================================================================

OVERVIEW:
This section defines the types and API structures for the Create Order functionality 
in the seller deals feature. The system allows sellers to:
1. Create individual orders from buyer offers by modifying items
2. Use "Take All" to instantly create orders with all available variants

COMPONENT ARCHITECTURE:
----------------------

1. CreateOrderSheet.tsx - Main component located at:
   src/features/seller-deals/components/CreateOrderSheet.tsx
   
   This React component handles:
   - UI for displaying buyer's original order items
   - "Add More Variants" functionality for sellers to add new products
   - Individual item quantity/price modifications
   - "Take All" button that processes all available variants at once
   - Form submission and API integration
   - Error handling and loading states

2. sellerQueryService.ts - API service layer located at:
   src/features/seller-deals/services/sellerQueryService.ts
   
   Contains service functions:
   - fetchOrderItemsByOfferId(): Gets buyer's original order items
   - fetchCatalogListingsVariantsForCreateOrder(): Gets available variants for seller
   - createOrderFromOffer(): Submits order modifications to backend API

DATA FLOW ARCHITECTURE:
-----------------------

STEP 1: COMPONENT INITIALIZATION
- CreateOrderSheet receives props: catalogOfferId, offerPublicId, shipping/billing addresses
- Component fetches two data sources simultaneously using React Query:
  a) Buyer's original order items via fetchOrderItemsByOfferId()
  b) Available variants via fetchCatalogListingsVariantsForCreateOrder()

STEP 2: USER INTERACTION SCENARIOS

Scenario A: REGULAR ORDER CREATION
----------------------------------
- Seller modifies quantities/prices of buyer's items in the UI
- Seller can remove items by deleting them from the list
- Seller can add new variants via "Add More Variants" dropdown
- On "Create Order" button click, handleCreateOrder() is triggered
- buildModificationsArray() analyzes differences between original and current state
- Creates ModificationItem[] array with appropriate actions:
  * REMOVE_PRODUCT: For items deleted from original buyer list
  * ADD_PRODUCT: For new variants added by seller
  * UPDATE_EXISTING: For items with modified quantity/price

Scenario B: TAKE ALL FUNCTIONALITY  
----------------------------------
- Seller clicks "Take All" button to bypass individual item management
- handleTakeAll() is triggered immediately
- Does NOT modify UI state (orderItems array remains unchanged)
- Directly creates ModificationItem[] array from all availableVariants
- Each variant becomes an ADD_PRODUCT modification
- Immediately calls API without UI state changes

MODIFICATION ACTIONS EXPLAINED:
--------------------------------

1. ADD_PRODUCT Action:
   Used when: Seller adds new variants not in original buyer order
   API Payload Structure:
   {
     "action": "ADD_PRODUCT",
     "catalogProductVariantPublicId": "VARIANT_123",
     "quantity": 20,
     "sellerPricePerUnit": 15.99
   }
   
   Key Rules:
   - Does NOT include catalogOfferItemPublicId for seller additions
   - Uses quantity and sellerPricePerUnit (NOT newQuantity/newSellerPricePerUnit)
   - catalogOfferItemPublicId only included if not a temp seller addition (temp-new-*)

2. UPDATE_EXISTING Action:
   Used when: Seller modifies quantity/price of buyer's original items
   API Payload Structure:
   {
     "action": "UPDATE_EXISTING", 
     "catalogOfferItemPublicId": "ITEM_456",
     "catalogProductVariantPublicId": "VARIANT_123",
     "quantity": 10,              // Original buyer quantity
     "sellerPricePerUnit": 12.99, // Original buyer price
     "newQuantity": 15,           // Seller's modified quantity
     "newSellerPricePerUnit": 14.99 // Seller's modified price
   }
   
   Key Rules:
   - Includes both original (quantity/sellerPricePerUnit) AND new values
   - Requires catalogOfferItemPublicId from buyer's original item
   - Used even if no actual changes (quantity/price same as original)

3. REMOVE_PRODUCT Action:
   Used when: Seller removes items from buyer's original order
   API Payload Structure:
   {
     "action": "REMOVE_PRODUCT",
     "catalogOfferItemPublicId": "ITEM_789"
   }
   
   Key Rules:
   - Minimal payload - only action and catalogOfferItemPublicId
   - No quantity, price, or variant information needed
   - Identifies item to remove by buyer's original catalogOfferItemPublicId

# Create Order Implementation Plan

## Key Functions and Their Responsibilities

1. buildModificationsArray() - Located in CreateOrderSheet.tsx
   Purpose: Analyzes differences between buyer's original items and current UI state
   Logic:
   - Compares buyerItems (original) vs orderItems (current UI state)
   - Identifies removed items (in buyerItems but not in orderItems)
   - Identifies added/modified items (in orderItems)
   - Uses determineModificationAction() to classify each change
   - Returns ModificationItem[] array for API submission

2. handleCreateOrder() - Located in CreateOrderSheet.tsx
   Purpose: Processes regular order creation with UI state modifications
   Flow:
   - Calls buildModificationsArray() to get modifications
   - Creates CreateOrderPayload with required fields
   - Omits empty optional fields (sellerMessage, orderNotes, modificationReason)
   - Calls createOrderFromOffer() service
   - Handles success (triggers onOrderCreated callback) or error states

3. handleTakeAll() - Located in CreateOrderSheet.tsx
   Purpose: Bypasses UI state and directly creates order with all available variants
   Flow:
   - Maps availableVariants to ModificationItem[] array
   - Each variant becomes ADD_PRODUCT with current quantity/price
   - Does NOT include catalogOfferItemPublicId (seller additions)
   - Creates payload and calls API immediately
   - No UI state changes - operates independently of orderItems state

4. determineModificationAction() - Located in CreateOrderSheet.tsx

   Purpose: Analyzes individual items to determine if they need ADD_PRODUCT or UPDATE_EXISTING

   Logic:

   - Looks for item in buyer's original order by catalogOfferItemPublicId
   - If not found: return ADD_PRODUCT (seller addition)
   - If found: return UPDATE_EXISTING (modification of buyer's item)

## API Integration Details

### Endpoint and Service Method

- **Endpoint**: `POST /api/catalog-offers/{offerPublicId}/orders`
- **Service Method**: `createOrderFromOffer()` in `sellerQueryService.ts`

### Request Payload Structure

```json
{
  "offerPublicId": "string",           // Required: Identifies the offer
  "autoCreateOrder": true,            // Required: Always true for this flow
  "shippingAddressPublicId": "string", // Required: From component props
  "billingAddressPublicId": "string",  // Required: From component props
  "modifications": "ModificationItem[]", // Required: Array of modifications
  "sellerMessage": "string",          // Optional: Only if not empty
  "orderNotes": "string"              // Optional: Only if not empty
}
```

### Response Structure

```json
{
  "success": "boolean",
  "orderId": "string",  // Present on success
  "errors": "string[]"    // Present on failure
}
```

## Calculations and Formulas

### Price Calculations (CreateOrderSheetItems.tsx)

- Total Price Per Item: `item.requestedQuantity * price`
  - Where price is either `item.buyerOfferPrice` (buyer selection) or `inputValues[item.id]` (seller input)
  - Location: calculateTotalPrice function (line ~130)

- Percent Off MSRP: `((item.retailPrice - offerPrice) / item.retailPrice) * 100`
  - Only shown if retailPrice > 0 and offerPrice > 0
  - Only displays positive values (discounts)
  - Location: Inline calculation in JSX (line ~425)

### Order Summary Stats (CreateOrderSheet.tsx)

- Total Units: Sum of all `item.requestedQuantity`
  - Location: totalUnits calculation (line ~200)

- Total Value: Sum of `(item.requestedQuantity * price)` for all items
  - Location: totalValue calculation (line ~210)

- Average Price: `totalValue / totalUnits`
  - Only calculated if totalUnits > 0
  - Location: averagePrice calculation (line ~220)

- Total Percent Off: Weighted average of individual item percent offs
  - Formula: Sum of `(itemPercentOff * itemValue)` / Total Value
  - Only shows positive values
  - Location: totalPercentOff calculation (line ~230)

### Currency Formatting

- Uses Intl.NumberFormat with 'en-US' locale
- Default currency: 'USD'
- Location: formatCurrency function in both components

### Input Validation

- Quantity: Clamped to non-negative values
- Price: Must be valid currency amount
- Percent Off: Only calculated for valid price/quantity combinations

### API Payload Calculations

- Modifications array structure varies by action type
- Price differences calculated for UPDATE actions
- Quantity differences calculated for UPDATE actions

## Error Handling

### Component Level

- Loading states during API calls (isSubmitting)
- Error dialogs for API failures (errorMessage, errorOpen)
- Form validation before submission
- Disabled states for buttons during processing

### API Level

- Service functions return standardized response format
- Error messages passed through from backend
- Network error handling with try/catch blocks

### User Feedback

- Success: onOrderCreated callback triggers, modal closes
- Failure: Error dialog displays with specific error message
- Loading: Buttons show spinners and disabled states

## Type Safety

All types are strictly defined with TypeScript interfaces:

- ModificationItem: Supports different field requirements per action type
- CreateOrderPayload: Ensures required fields are present
- Optional fields are properly typed to prevent empty string submissions
- Service responses are typed for proper error handling

## Testing Considerations

### Regular Order Flow

- Test item modifications (quantity/price changes)
- Test item removals
- Test seller additions via dropdown
- Test empty field handling

### Take All Flow

- Test with various available variants
- Test API payload structure
- Test independence from UI state
- Test error scenarios

### Integration Tests

- API payload validation
- Response handling
- Error state management
- Loading state behavior

*/

## RECENT UPDATES AND FIXES (January 2025)

### 1. EMPTY FIELDS HANDLING FIX
**Problem:** The API payload was including empty `sellerMessage` and `orderNotes` keys even when they had no values.

**Solution:** Added proper conditional checks to only include these fields if they contain actual values:
```typescript
// Only add optional fields if they have values - don't include empty keys
const sellerMessage = ''; // TODO: Add input field for seller message
const orderNotes = ''; // TODO: Add input field for order notes

if (sellerMessage?.trim()) {
  payload.sellerMessage = sellerMessage.trim();
}
if (orderNotes?.trim()) {
  payload.orderNotes = orderNotes.trim();
}
```

**Files Modified:**
- `CreateOrderSheet.tsx`: Updated both `handleCreateOrder` and `handleTakeAll` functions

### 2. PERCENT OFF CALCULATION AND DISPLAY
**Problem:** Need to show % off MSRP in the total statistics and on each row for buyer/seller items.

**Solution:** 

#### A. Added Retail Price Support to Types:
```typescript
// Enhanced SellerOrderItem and related types to include retail price
export interface SellerOrderItem {
  // ... existing fields
  retailPrice?: number // For % off calculation
}
```

#### B. Updated API Queries:
```typescript
// Added retail_price to the select query in fetchOrderItemsByOfferId
retail_price: true, // Now fetches retail price from API
```

#### C. Added Percent Off Calculation Logic:
```typescript
// In CreateOrderSheet: Calculate total % off using the formula from ExcelExportService
const percentOff = totalRetailValue > 0 
  ? ((totalRetailValue - totalOfferValue) / totalRetailValue) * 100
  : 0;
```

#### D. Updated Stats Display:
```tsx
// Changed from 3-column to 4-column grid to include % off
<div className="mb-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* ... existing stats */}
  <div className="rounded-lg border border-gray-200 p-4">
    <div className="font-medium text-gray-500 text-sm">% Off MSRP</div>
    <div className="font-semibold text-2xl text-gray-900">
      {totalPercentOff > 0 ? `${totalPercentOff.toFixed(1)}%` : 'N/A'}
    </div>
  </div>
</div>
```

#### E. Added Per-Row Percent Off Display:
```tsx
// In CreateOrderSheetItems: Show % off below total price for each item
{(() => {
  const percentOff = calculatePercentOff(item);
  return percentOff !== null && percentOff > 0 ? (
    <span className="text-green-600 text-xs font-medium">
      {percentOff.toFixed(1)}% off MSRP
    </span>
  ) : null;
})()}
```

#### F. Enhanced Variant Selection:
```typescript
// Updated handleVariantSelection to include retail price when seller adds variants
retailPrice: Number.parseFloat(selectedVariant.retail_price) || undefined,
```

**Files Modified:**
- `types/index.ts`: Added retailPrice to SellerOrderItem and OrderItemsData
- `sellerQueryService.ts`: Added retail_price to API query and transformation
- `CreateOrderSheet.tsx`: Added % off calculation logic and stats display
- `CreateOrderSheetItems.tsx`: Added per-row % off calculation and display

### 3. VALIDATION FOR SELLER ADDITIONS
**Problem:** Need to disable Create Order button when seller additions have 0 quantity or 0 price.

**Solution:**
```typescript
// Added validation logic to check seller additions
const hasInvalidSellerAdditions = useMemo(() => {
  return orderItems.some(item => {
    if (item.isSellerAddition) {
      return item.requestedQuantity <= 0 || item.buyerOfferPrice <= 0;
    }
    return false;
  });
}, [orderItems]);

// Updated Create Order button to be disabled when validation fails
<button
  disabled={isSubmitting || hasInvalidSellerAdditions}
  // ... rest of props
```

**Files Modified:**
- `CreateOrderSheet.tsx`: Added validation logic and button disable condition

### 4. DEBUG LOGGING FOR PERCENT OFF ISSUES
**Problem:** User reported that % off shows "N/A" at the top and doesn't appear on rows.

**Solution:** Added comprehensive debug logging to identify the root cause:
- Total calculation logging in CreateOrderSheet
- Individual item calculation logging in CreateOrderSheetItems
- API data structure logging to verify retail price availability

**Files Modified:**
- `CreateOrderSheet.tsx`: Added debug logs for total % off calculation
- `CreateOrderSheetItems.tsx`: Added debug logs for individual item % off

### TESTING CHECKLIST:
1. ✅ Empty `sellerMessage` and `orderNotes` keys are not sent in API payload
2. 🔍 **TO DEBUG:** % off calculation shows actual percentages instead of "N/A"
3. 🔍 **TO DEBUG:** Individual items show % off when retail price is available
4. ✅ Create Order button is disabled when seller additions have invalid quantity/price
5. ✅ All existing functionality (Create Order, Take All) continues to work

### DEBUGGING NEXT STEPS:
The debug logging will help identify:
- Whether retail price data is coming from the API
- Whether the calculation logic is working correctly
- Whether the display logic is functioning properly

Check browser console for detailed logs when testing the CreateOrderSheet component.
