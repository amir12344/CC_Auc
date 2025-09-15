# Buyer Preference Popup Testing Guide

## Overview
This guide provides comprehensive testing procedures for the buyer preference popup system and its integration with the preferences page.

## Quick Start Testing

### 1. Access the Popup
- Navigate to the marketplace page (`/marketplace`)
- The popup should auto-trigger after 1 second for new buyers
- Or click "Setup Wizard" button in preferences page

### 2. Test Basic Flow
- Step through all 15 steps using "Next" button
- Verify each step saves data correctly
- Complete the flow and verify "Preferences saved" status

### 3. Test Preferences Page Sync
- Navigate to `/buyer/account/preferences`
- Verify all popup selections appear in the preferences page
- Make changes in preferences page
- Re-open popup and verify changes are reflected

## Detailed Test Cases

### A. Popup Auto-Trigger Testing

#### Test Case A1: New Buyer Auto-Trigger
**Steps:**
1. Clear browser localStorage (`localStorage.clear()` in console)
2. Navigate to `/marketplace`
3. Wait 1 second

**Expected Result:**
- Popup should automatically appear
- Shows step 1/15 (Brands)
- Progress bar shows 0% completion

#### Test Case A2: Returning Buyer Skip
**Steps:**
1. Complete the popup flow once
2. Refresh the marketplace page or navigate away and back
3. Wait 5 seconds

**Expected Result:**
- Popup should NOT appear
- No auto-trigger for completed users

#### Test Case A3: Manual Trigger
**Steps:**
1. Go to `/buyer/account/preferences`
2. Click "Setup Wizard" button

**Expected Result:**
- Popup opens immediately
- Shows step 1/15 or last incomplete step

### B. Step-by-Step Navigation Testing

#### Test Case B1: Brands Step (Step 1/15)
**Steps:**
1. Open popup to brands step
2. Click dropdown to open brand selection
3. Search for "Nike" in search box
4. Select Nike, Adidas, Apple from the list
5. Verify chips appear below dropdown
6. Click X on Nike chip to remove it
7. Click "Next"

**Expected Result:**
- Search filters brands correctly
- Selected brands show as blue chips
- Chips can be removed by clicking X
- Next button advances to Categories step
- Data persists when navigating back

#### Test Case B2: Categories Step (Step 2/15)
**Steps:**
1. Navigate to categories step
2. Select "Clothing", "Electronics", "Footwear"
3. Verify green chips appear
4. Click "Next" to subcategories
5. Go back and remove "Clothing"
6. Return to subcategories step

**Expected Result:**
- Categories show as green chips
- Subcategories related to "Clothing" disappear when category is removed
- Available subcategories update dynamically

#### Test Case B3: Subcategories Step (Step 3/15)
**Steps:**
1. Ensure categories are selected (Electronics, Footwear)
2. Open subcategory dropdown
3. Select available subcategories
4. Verify orange chips appear

**Expected Result:**
- Only subcategories related to selected categories appear
- Orange chips display selected subcategories
- If no categories selected, shows "No categories selected" message

#### Test Case B4: Budget Step (Step 4/15)
**Steps:**
1. Navigate to budget step
2. Enter minimum budget: $50
3. Enter maximum budget: $500
4. Try entering invalid values (letters, negative numbers)
5. Click "Next"

**Expected Result:**
- Numeric inputs only accept numbers
- Dollar sign icons appear in input fields
- Values save correctly and persist

#### Test Case B5: Discount Step (Step 5/15)
**Steps:**
1. Navigate to discount step
2. Open dropdown and select "30-40% off retail"
3. Verify visual feedback appears
4. Change selection to "50-60% off retail"

**Expected Result:**
- Dropdown opens with all discount options
- Selection shows visual feedback/confirmation
- Purple-themed styling consistent with step

#### Test Case B6: Auction/Catalog Step (Step 6/15)
**Steps:**
1. Navigate to auction/catalog step
2. Check both "Auction" and "Catalog" boxes
3. Uncheck "Auction"
4. Verify only "Catalog" remains selected

**Expected Result:**
- Both options can be selected simultaneously
- Checkboxes work independently
- Comparison table shows differences between options

#### Test Case B7: Where You Sell Overview (Step 7/15)
**Steps:**
1. Navigate to overview step
2. Verify platform categories display
3. Check if any previously selected platforms show

**Expected Result:**
- Shows 4 platform categories (Online, Physical, Live Events, B2B)
- If platforms already selected, shows count and list
- Educational content about different platform types

#### Test Cases B8-B15: Individual Platform Steps
**For each platform step (8-15):**
1. Navigate to platform step
2. Read platform description
3. Check the platform checkbox
4. Click "Next"
5. Go back and verify selection persists

**Expected Result:**
- Platform description shows clearly
- Checkbox saves selection
- Selection persists when navigating back/forward

### C. Data Persistence Testing

#### Test Case C1: Browser Refresh
**Steps:**
1. Complete first 5 steps of popup
2. Refresh the browser page
3. Re-open popup

**Expected Result:**
- Popup resumes from step 6
- All previous selections remain intact
- Progress bar shows correct completion percentage

#### Test Case C2: Tab Closure
**Steps:**
1. Complete first 8 steps
2. Close browser tab
3. Open new tab, navigate to buyer page
4. Re-open popup

**Expected Result:**
- All data persists
- Popup continues from step 9
- No data loss

#### Test Case C3: Browser Restart
**Steps:**
1. Complete 10 steps
2. Close entire browser
3. Restart browser, navigate to site
4. Check popup state

**Expected Result:**
- localStorage persists data
- Popup resumes correctly
- All selections maintained

### D. Preferences Page Sync Testing

#### Test Case D1: Popup to Preferences Sync
**Steps:**
1. In popup, select brands: Nike, Adidas
2. Select categories: Clothing, Electronics  
3. Set budget: $100-$500
4. Complete popup
5. Navigate to `/buyer/account/preferences`

**Expected Result:**
- Brands section shows Nike, Adidas chips
- Categories section shows Clothing, Electronics chips
- Budget inputs show $100 and $500
- "Preferences saved" indicator appears

#### Test Case D2: Preferences to Popup Sync
**Steps:**
1. Go to preferences page
2. Add new brand: Apple
3. Change budget to $200-$800
4. Click "Setup Wizard" to open popup
5. Navigate to relevant steps

**Expected Result:**
- Brands step shows Nike, Adidas, Apple
- Budget step shows $200-$800
- Changes sync immediately

#### Test Case D3: Reset Functionality
**Steps:**
1. Complete popup with various selections
2. Go to preferences page
3. Click "Reset All Preferences"
4. Confirm reset
5. Check popup state

**Expected Result:**
- Confirmation dialog appears
- All preferences clear to defaults
- Popup resets to step 1 with no selections
- Auto-trigger re-enables for "new" user experience

### E. Exit and Skip Testing

#### Test Case E1: Exit Confirmation
**Steps:**
1. Open popup and make some selections
2. Click "X" or try to close popup
3. Verify exit confirmation dialog
4. Click "Exit" to confirm

**Expected Result:**
- Dialog asks "Are you sure you want to exit without finishing..."
- Selections are saved even if popup is closed
- Can resume later from where left off

#### Test Case E2: Skip Functionality
**Steps:**
1. Open popup at any step
2. Click "Skip" button
3. Verify behavior

**Expected Result:**
- Popup closes without completing
- Selections made so far are saved
- Auto-trigger disabled (marked as "completed")
- Can manually re-open popup later

### F. Mobile Responsiveness Testing

#### Test Case F1: Mobile Layout
**Test on various screen sizes:**
- iPhone SE (375px)
- iPhone 12 (390px) 
- iPad (768px)
- Large screens (1200px+)

**Expected Result:**
- Popup scales appropriately
- Touch targets are adequate (44px minimum)
- Text remains readable
- No horizontal scrolling required

#### Test Case F2: Touch Interactions
**Steps:**
1. Test dropdown opening/closing via touch
2. Test chip removal via touch
3. Test checkbox toggling
4. Test input field focus

**Expected Result:**
- All touch interactions work smoothly
- No double-tap requirements
- Proper touch feedback

### G. Error Handling Testing

#### Test Case G1: Invalid Data
**Steps:**
1. Try entering very large numbers in budget
2. Try entering special characters
3. Try rapid clicking of buttons

**Expected Result:**
- Appropriate validation messages
- No crashes or broken states
- Graceful error handling

#### Test Case G2: Network Issues
**Steps:**
1. Disable network connection
2. Attempt to use popup
3. Re-enable connection

**Expected Result:**
- Popup works offline (localStorage based)
- No network dependency for core functionality
- Data persists through network issues

## Test Data Reference

### Sample Test Data
Use this data for consistent testing:

**Brands:** Nike, Adidas, Apple, Samsung, Sony  
**Categories:** Clothing, Electronics, Footwear  
**Budget:** Min: $50, Max: $500  
**Discount:** 30-40% off retail  
**Listing Types:** Both Auction and Catalog  
**Platforms:** DiscountRetail, StockX, AmazonWalmart  

## Debugging Tips

### Console Commands
```javascript
// View current preferences
JSON.parse(localStorage.getItem('buyer-preferences'))

// Clear all preferences
localStorage.removeItem('buyer-preferences')
localStorage.removeItem('buyer-preferences-popup-shown')

// Force popup to appear
localStorage.setItem('buyer-preferences-popup-shown', 'false')
```

### Common Issues
1. **Popup not appearing:** Check localStorage keys
2. **Data not syncing:** Verify shared hook usage
3. **Chips not removing:** Check onClick handlers
4. **Mobile issues:** Test touch vs click events

## Success Criteria
✅ All 15 steps navigate correctly  
✅ Data persists across browser sessions  
✅ Popup and preferences page stay synchronized  
✅ Mobile responsive on all target devices  
✅ Auto-trigger works for new buyers only  
✅ Exit confirmation prevents data loss  
✅ Skip functionality works as expected  
✅ Reset clears all data appropriately  

## Reporting Issues
When reporting issues, include:
- Browser and version
- Device type and screen size
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshot/video if relevant

---

**Ready for comprehensive testing across all test cases above!** 