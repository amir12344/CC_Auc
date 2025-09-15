# Metadata Guidelines for Commerce Central

## Overview
This document outlines the proper metadata structure for our Next.js 13+ App Router application to prevent SEO conflicts and ensure optimal search engine results.

## Metadata Hierarchy

### 1. Root Layout (`src/app/layout.tsx`)
- **Purpose**: Global defaults and base metadata
- **Contains**: Base title, description, OpenGraph, Twitter cards, icons, verification codes
- **Rule**: This is the foundation metadata that applies to all pages

### 2. Section Layouts (e.g., `layout.tsx` files in feature folders)
- **Purpose**: Title templates for consistent branding
- **Contains**: ONLY title templates, no descriptions
- **Rule**: Use `title.template` to create consistent page titles across sections

```tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Section Name - Commerce Central',
    default: 'Section Name - Commerce Central',
  },
  // NO description here - causes conflicts!
};
```

### 3. Page Files (`page.tsx`)
- **Purpose**: Specific page metadata
- **Contains**: Complete metadata including title, description, OpenGraph, Twitter cards, canonical URLs
- **Rule**: This is where all specific page SEO optimization happens

```tsx
export const metadata: Metadata = {
  title: 'Specific Page Title',
  description: 'Specific page description for SEO',
  alternates: {
    canonical: 'https://www.commercecentral.io/page-url'
  },
  openGraph: {
    title: 'Specific Page Title',
    description: 'Specific page description for SEO',
    url: 'https://www.commercecentral.io/page-url',
  },
  twitter: {
    title: 'Specific Page Title',
    description: 'Specific page description for SEO',
  },
};
```

## Common Mistakes to Avoid

### ❌ Wrong: Metadata in both layout and page
```tsx
// DON'T do this - causes conflicts
// layout.tsx
export const metadata = {
  title: 'Section Title',
  description: 'Section description', // ❌ Conflicts with page
};

// page.tsx
export const metadata = {
  title: 'Page Title', 
  description: 'Page description', // ❌ Conflicts with layout
};
```

### ✅ Correct: Template in layout, details in page
```tsx
// layout.tsx
export const metadata = {
  title: {
    template: '%s | Section - Commerce Central',
    default: 'Section - Commerce Central',
  },
  // No description here
};

// page.tsx
export const metadata = {
  title: 'Specific Page Title', // Will become "Specific Page Title | Section - Commerce Central"
  description: 'Specific page description',
};
```

## Fixed Structure

### Current Structure (After Fix):
```
src/app/
├── layout.tsx (Global metadata + base SEO)
├── buyer/
│   ├── layout.tsx (NO metadata - just layout structure)
│   ├── page.tsx (Buyer dashboard metadata)
│   └── dashboard/
│       ├── layout.tsx (Title template only)
│       └── */page.tsx (Specific page metadata)
├── website/
│   ├── layout.tsx (Title template only)
│   ├── page.tsx (Homepage metadata)
│   └── legal/
│       ├── layout.tsx (Title template only)
│       └── */page.tsx (Legal page metadata)
└── earlyaccess/
    ├── layout.tsx (NO metadata - just layout structure)
    └── page.tsx (Early access metadata)
```

## Best Practices

1. **One source of truth**: Each piece of metadata should be defined in only one place
2. **Templates for consistency**: Use title templates in section layouts for branding consistency
3. **Details in pages**: Put all specific metadata (descriptions, URLs, images) in page files
4. **Test metadata**: Use browser dev tools to verify which metadata is actually being used
5. **Canonical URLs**: Always include canonical URLs in page metadata for SEO
6. **OpenGraph/Twitter**: Include social media metadata in page files for proper sharing

## Testing Metadata

Use these tools to verify metadata is working correctly:
- Browser Dev Tools: Check `<head>` section
- Google Search Console: Monitor how pages appear in search
- Social Media Debuggers: Facebook Debugger, Twitter Card Validator
- Next.js Dev Tools: Check metadata in development mode

## Migration Checklist

When fixing metadata issues:
- [ ] Remove duplicate metadata from layout files
- [ ] Keep only title templates in section layouts
- [ ] Ensure all page files have complete metadata
- [ ] Test pages in browser dev tools
- [ ] Verify social media sharing works correctly
- [ ] Check Google Search Console for improvements 