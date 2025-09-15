# SEO Schema Refactor Documentation

## Overview

This document outlines the comprehensive refactoring of SEO schema implementation across the Commerce Central website. The main objective was to move all schema.org structured data from the `<body>` tag to the `<head>` tag using Next.js Metadata API, eliminating duplicate schema codes and ensuring proper SEO compliance.

## Problem Statement

- Schema.org JSON-LD scripts were incorrectly injected into the `<body>` of pages instead of the `<head>`
- Duplicate schema scripts appeared on pages, causing potential SEO issues
- Individual pages used Next.js `<Script>` components inside page components, which render in the body, not the head

## Solution Approach

Migrated all page-level schema injection to Next.js Metadata API by adding JSON-LD schema under the `other['ld+json']` property in each page's `metadata` export. This ensures schema is properly injected into the `<head>` section.

### Before (Problematic Implementation)

```tsx
export default function Page() {
  return (
    <>
      <Script
        id="ld-breadcrumb-schema"
        strategy="beforeInteractive"
        type="application/ld+json"
      >
        {JSON.stringify(generatePageBreadcrumb('/path', 'Title'))}
      </Script>
      <PageContent />
    </>
  );
}
```

### After (Correct Implementation)

```tsx
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  other: {
    'ld+json': JSON.stringify(
      generatePageBreadcrumb('/path', 'Title')
    )
  }
};

export default function Page() {
  return <PageContent />;
}
```

## Pages Refactored

All pages in the Commerce Central website have been successfully refactored:

### Main Website Pages (`src/app/website`)

- `/website/podcast` - Podcast landing page
- `/website/seller` - Seller information page
- `/website/buyer` - Buyer information page 
- `/website/blog` - Blog main page
- `/website/blog/buyer` - Buyer blog category page
- `/website/blog/seller` - Seller blog category page

### Legal Pages (`src/app/website/legal`)

| Page | Path | Schema Type |
|------|------|-------------|
| Legal Hub | `/website/legal` | Breadcrumb |
| Privacy Policy | `/website/legal/privacy-policy` | Breadcrumb |
| Terms & Conditions | `/website/legal/terms` | Breadcrumb |
| Data Processing | `/website/legal/data-processing` | Breadcrumb |
| Data Processing Addendum | `/website/legal/addendum` | Breadcrumb |

### Dynamic Blog Post Pages

| Page Type | Path Pattern | Schema Types |
|-----------|--------------|-------------|
| Buyer Blog Posts | `/website/blog/buyer/[slug]` | Breadcrumb + Article |
| Seller Blog Posts | `/website/blog/seller/[slug]` | Breadcrumb + Article |

### Hidden Pages (`src/app/(hiddenPages)`)

- `/online-liquidation-auctions` - Online auction platform page
- `/wholesale-liquidation-platform` - Wholesale platform page
- `/wholesale-pallet-liquidation` - Pallet liquidation page

## Technical Implementation Details

### Single Schema Pages

For pages with only breadcrumb schema:

```tsx
export const metadata: Metadata = {
  // ... other metadata
  other: {
    'ld+json': JSON.stringify(
      generatePageBreadcrumb('/path', 'Page Title')
    )
  }
};
```

### Multiple Schema Pages (Dynamic Blog Posts)

For pages with both breadcrumb and article schema:

```tsx
export const metadata: Metadata = {
  // ... other metadata
  other: {
    'ld+json': [
      generatePageBreadcrumb(`/path/${slug}`, post.title),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: post.thumbnailImage,
        author: {
          '@type': 'Person',
          name: 'Commerce Central',
        },
        datePublished: new Date(post.date).toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.commercecentral.io/path/${slug}`,
        },
      }
    ]
  }
};
```

## Key Changes Made

1. **Removed all `<Script>` components** injecting schema from page components
2. **Added schema to metadata exports** using the `other['ld+json']` property
3. **Maintained exact schema content** - no changes to the actual schema structure
4. **Fixed legal hub page** - Created new `/website/legal/page.tsx` with navigation cards
5. **Preserved breadcrumb strings** - Used exact same strings as originally implemented

## Validation Steps

1. ✅ Verified no remaining `<Script>` tags with schema injection in the codebase
2. ✅ Confirmed all pages have schema moved to metadata exports
3. ✅ Tested that breadcrumb strings match original implementation
4. ✅ Ensured dynamic blog posts include both breadcrumb and article schema

## July 2025 Dynamic Breadcrumb Fix

Dynamic routes (e.g. `/website/blog/*/[slug]`) were missing breadcrumb schema because the server component relied on an exact pathname-to-title map.

**Changes implemented**

| File | Update |
|------|--------|
| `src/middleware.ts` | Keeps setting the `x-next-pathname` header so server components know the current URL. |
| `src/utils/metadata.ts` | `generatePageBreadcrumbItems` now humanises every path segment – turning `my-first-post` → `My First Post`. |
| `src/components/BreadcrumbSchema.tsx` | Falls back to a humanised title derived from the last slug when the map lacks an entry and always builds a JSON-LD object with those items. |

Result: **All pages, including dynamic slugs, now inject a valid `<script type="application/ld+json" id="breadcrumb-schema">` inside `<head>` with human-readable titles and no duplicates.**

---

## Benefits Achieved

- **Proper SEO compliance** - Schema now correctly appears in `<head>` section
- **Eliminated duplicates** - No more duplicate schema scripts on pages
- **Improved performance** - Removed unnecessary Script components from page renders
- **Better maintainability** - Centralized schema management through metadata exports
- **Search engine optimization** - Proper schema placement for better crawling and indexing

## Files Modified

### Core Utility Files (No Changes)

- `src/utils/metadata.ts` - Schema generation functions (unchanged)
- `src/app/layout.tsx` - Root layout with organization/website schema (unchanged)

### Website Pages

- `src/app/website/podcast/page.tsx`
- `src/app/website/seller/page.tsx`
- `src/app/website/buyer/page.tsx`
- `src/app/website/blog/page.tsx`
- `src/app/website/blog/buyer/page.tsx`
- `src/app/website/blog/seller/page.tsx`
- `src/app/website/blog/buyer/[slug]/page.tsx`
- `src/app/website/blog/seller/[slug]/page.tsx`

### Legal Pages

- `src/app/website/legal/page.tsx` (created)
- `src/app/website/legal/privacy-policy/page.tsx`
- `src/app/website/legal/terms/page.tsx`
- `src/app/website/legal/data-processing/page.tsx`
- `src/app/website/legal/addendum/page.tsx`

### Hidden Pages

- `src/app/(hiddenPages)/online-liquidation-auctions/page.tsx`
- `src/app/(hiddenPages)/wholesale-liquidation-platform/page.tsx`
- `src/app/(hiddenPages)/wholesale-pallet-liquidation/page.tsx`

## Testing Recommendations

1. **Validate with Google Rich Results Test** - Test key pages to ensure schema is properly detected
2. **Check page source** - Verify schema appears in `<head>` section, not `<body>`
3. **SEO audit tools** - Run tools like Screaming Frog to confirm no duplicate schema
4. **Manual verification** - Spot-check various page types to ensure proper schema injection

## Maintenance Notes

- **Future pages** should follow the new Metadata API pattern for schema injection
- **Never use `<Script>` components** for schema in page components - always use metadata exports
- **Schema generation functions** in `src/utils/metadata.ts` remain unchanged and should continue to be used
- **Root layout schema** (organization, website) remains in `src/app/layout.tsx` and should not be duplicated

---

**Completed:** July 2025  
**Developer:** AI Assistant  
**Status:** ✅ All schema successfully migrated to head section via Next.js Metadata API for proper schema placement in the document head.
