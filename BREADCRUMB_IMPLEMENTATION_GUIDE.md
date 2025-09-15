# Breadcrumb Schema Implementation Guide

## Overview

This guide explains how to implement page-specific breadcrumb schemas to fix the SEO duplication issue caused by the previous static breadcrumb implementation.

## Problem Fixed

Previously, `getMainPagesBreadcrumb()` was injected globally in `src/app/layout.tsx`, causing all pages to have the same static breadcrumb schema. This created SEO issues:

- Misleading search engines about page hierarchy
- Poor user experience with incorrect breadcrumbs
- Potential SEO penalties for duplicate/irrelevant structured data
- Lost rich snippet opportunities

## Solution Implemented

### 1. Removed Static Breadcrumb from Root Layout

- Removed `getMainPagesBreadcrumb()` call from `src/app/layout.tsx`
- Removed unused import

### 2. Created Dynamic Breadcrumb Generator

Added `generatePageBreadcrumb()` function in `src/utils/metadata.ts`:

```typescript
export const generatePageBreadcrumb = (
  pagePath: string,
  pageTitle: string
): SchemaOrg => {
  // Generates contextual breadcrumbs based on the actual page path
}
```

### 3. Updated Key Pages

Implemented page-specific breadcrumb schemas for:

- **Homepage** (`/`): Simple home breadcrumb
- **Team Page** (`/website/team`): Home > Our Team
- **Buyer Page** (`/website/buyer`): Home > Buyer
- **Seller Page** (`/website/seller`): Home > Seller

## Implementation Pattern

For each page that needs breadcrumb schema:

### 1. Import Required Dependencies

```typescript
import Script from 'next/script'
import { generatePageBreadcrumb } from '@/src/utils/metadata'
```

### 2. Add Breadcrumb Schema to Component

```typescript
export default function YourPage() {
  return (
    <>
      {/* Page-specific breadcrumb schema */}
      <Script
        id='ld-breadcrumb-your-page'
        strategy='beforeInteractive'
        type='application/ld+json'
      >
        {JSON.stringify(
          generatePageBreadcrumb('/your/page/path', 'Your Page Title')
        )}
      </Script>
      {/* Your existing page content */}
      <YourPageContent />
    </>
  )
}
```

## Pages That Need Implementation

The following pages should be updated with page-specific breadcrumb schemas:

### Website Pages

- `/website/blog/buyer` - Blog > Buyer
- `/website/blog/seller` - Blog > Seller
- `/website/podcast` - Podcast
- `/website/legal/privacy-policy` - Legal > Privacy Policy
- `/website/legal/terms` - Legal > Terms
- `/website/legal/addendum` - Legal > Addendum
- `/website/legal/data-processing` - Legal > Data Processing

### Marketplace & Auth Pages

- `/marketplace` - Marketplace
- `/auth/login` - Login
- `/auth/buyer-signup` - Sign Up > Buyer
- `/auth/seller-signup` - Sign Up > Seller

### User Dashboard Pages

- `/buyer/deals` - Buyer > Deals
- `/buyer/account` - Buyer > Account
- `/seller/dashboard` - Seller > Dashboard

## Best Practices

### 1. Use Descriptive Page Titles

```typescript
// Good
generatePageBreadcrumb(
  '/website/buyer',
  'Buy Surplus & Returned Pallets Online'
)

// Avoid
generatePageBreadcrumb('/website/buyer', 'Buyer')
```

### 2. Unique Script IDs

Ensure each page has a unique script ID:

```typescript
<Script id="ld-breadcrumb-unique-page-name" ... >
```

### 3. Match URL Structure

Ensure the `pagePath` parameter matches the actual URL structure:

```typescript
// For URL: /website/blog/buyer
generatePageBreadcrumb('/website/blog/buyer', 'Buyer Blog')
```

### 4. Consider User Experience

Breadcrumb titles should be user-friendly and match what users see in the UI.

## Testing

After implementation:

1. **Validate Schema**: Use Google's Rich Results Test tool
2. **Check Uniqueness**: Ensure each page has different breadcrumb data
3. **Verify Hierarchy**: Confirm breadcrumbs reflect actual page hierarchy
4. **Test SEO Impact**: Monitor search console for improvements

## Migration Notes

- `getMainPagesBreadcrumb()` is now deprecated but kept for backward compatibility
- A console warning is shown when the deprecated function is used
- All new pages should use `generatePageBreadcrumb()` instead

## Example Implementations

See the following files for reference:

- `src/app/page.tsx` - Homepage implementation
- `src/app/website/team/page.tsx` - Team page implementation
- `src/app/website/buyer/page.tsx` - Buyer page implementation
- `src/app/website/seller/page.tsx` - Seller page implementation

This implementation ensures each page has contextually accurate breadcrumb structured data, improving SEO and user experience.
