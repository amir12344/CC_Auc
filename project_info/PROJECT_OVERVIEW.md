# Commerce Central - Project Documentation

## 1. Project Overview
Commerce Central is an AI-powered B2B2C platform that revolutionizes excess inventory management for brands and retailers. The platform serves as an intelligent infrastructure layer that helps businesses recover maximum value from aging or surplus inventory while maintaining brand equity and control.

## 2. Problem Statement
Brands and retailers in Home, Household, and Appliance sectors face significant challenges with unsold, returned, and aging inventory. Current systems lack proactive inventory risk identification and controlled liquidation capabilities, leading to:
- Lost revenue opportunities
- Damaged brand equity
- Inefficient manual processes
- Suboptimal inventory recovery

## 3. Target Users

### 3.1 Seller Side (Brands & Retailers)
- **Economic Buyers**: 
  - Roles: CFOs, VPs of Supply Chain, Heads of Operations
  - Concerns: Inventory risk, working capital, margin protection, brand integrity
  
- **End Users**:
  - Roles: Inventory Planners, Demand Planners, Operations Managers
  - Daily Activities: Managing aging inventory, routing excess stock, selecting buyers, coordinating logistics
  
- **Technical Users**:
  - Roles: IT Managers, ERP Admins
  - Responsibilities: System integration, analytics setup, automation

### 3.2 Buyer Side
- **B2B Buyers**:
  - Roles: Business owners, Head buyers, Merchandisers
  - Needs: Access to quality inventory, transparent terms, better ROI
  
- **End Consumers**:
  - Access: Through D2C storefronts
  - Benefit: Premium products at outlet prices

## 4. Key Features and Components

### 4.1 Authentication & Security System ✅ **PRODUCTION READY**

**Protected Routes Implementation** (December 2024)
- **Client-Side Route Protection**: Using React wrapper components for authentication
- **Role-Based Access Control**: Buyer-only, seller-only, and authenticated user routes
- **Automatic Redirection**: Unauthorized users redirected to login with return URL preservation
- **Logout Security**: Users automatically redirected from protected pages after logout
- **Hydration-Safe**: Prevents server/client rendering mismatches

**Key Security Features:**
- ❌ No URL manipulation (typing protected URLs redirects to login)
- ❌ No logout persistence (users can't stay on protected pages after logout)
- ✅ Return URL preservation (users return to intended page after login)
- ✅ Role enforcement (buyers can't access seller routes)

**Implementation Files:**
- `src/components/auth/ProtectedRoute.tsx` - Core protection component
- `src/app/buyer/deals/layout.tsx` - Protected buyer layout
- `src/app/buyer/account/page.tsx` - Protected account page
- `src/app/auth/login/page.tsx` - Enhanced with return URL handling

**Usage Example:**
```typescript
export default function BuyerPage() {
  return (
    <BuyerProtectedRoute>
      {/* Protected content */}
    </BuyerProtectedRoute>
  );
}
```

### 4.2 Product Display System
   - Dynamic product cards with lazy-loaded images
   - Server-side rendered product detail pages
   - Interactive product gallery with thumbnail navigation
   - Responsive grid layout for product listings
   - Real-time inventory and pricing updates

### 4.3 Product Detail Page
   - Responsive two-column layout (image gallery + product info)
   - Interactive components (Buy Now, Bid, Wishlist)
   - Product metrics display (price, inventory, shipping)
   - Variant selection and comparison
   - Structured data for SEO (JSON-LD)

### 4.4 Authentication Flow
   - Protected routes with React wrapper components
   - JWT-based session management
   - Social login integration (via AWS Cognito)
   - Role-based access control
   - Session persistence and refresh

### 4.5 Marketplace Features
   - Category-based product filtering
   - Search functionality with typeahead
   - Sort and filter options
   - Product comparison tool
   - Saved items and watchlists

### 4.6 Marketplace (Buyer Side - Complete)
- Product browsing and discovery
- Detailed product pages with:
  - Product information
  - Bid/Buy options (context-aware)
  - Authentication-required actions
  - Post-login redirects

### 4.7 Seller Portal (Future Development)
- Inventory management
- Listing creation and management
- Analytics and reporting
- Order fulfillment

## 5. Technical Stack

- **Frontend Framework**: Next.js 15.3.0 (React 19)
- **Styling**: Tailwind CSS 4.1.4 with custom theming
- **State Management**: Redux Toolkit for global state, React Query for server state
- **UI Components**: Radix UI Primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: AWS Amplify with JWT tokens
- **Data Visualization**: Recharts for analytics
- **Animation**: Framer Motion for smooth transitions
- **Build Tool**: Vite for development and production builds

### 5.1 Custom Utility Classes

The project includes custom Tailwind CSS utility classes defined in `src/app/globals.css`:

#### Layout Utilities
- **`max-w-8xl`**: Custom max-width utility for ultra-wide layouts
  - Value: `calc(var(--page-width, 1620px) + var(--gutter, 64px) * 2)`
  - Result: `1748px` (1620px page width + 128px total gutters)
  - Usage: Similar to Tailwind's `max-w-7xl` but for larger screen layouts

#### CSS Custom Properties
- **`--page-width`**: `1620px` - Main content area width
- **`--gutter`**: `64px` - Spacing around content areas

#### Button Utilities
- **`btn`**: Base button styling with padding, rounded corners, and transitions
- **`btn-primary`**: Primary button with brand colors
- **`btn-secondary`**: Secondary button styling
- **`btn-outline`**: Outlined button variant

#### Component Utilities
- **`card`**: Standard card component with background, rounded corners, and shadow
- **`container`**: Custom container with auto margins and max-width of 7xl

These utilities maintain consistency with Tailwind's naming conventions while providing project-specific functionality.

## 6. Technical Architecture

### 6.1 Authentication Architecture

**Current Implementation** (Client-Side Protection)
```
User Access Protected Route
    ↓ 
ProtectedRoute Component
    ↓
Redux Authentication Check
    ↓
If Authenticated → Render Content
If Not → Redirect to Login with Return URL
    ↓
After Login → Redirect to Original Page
```

**Security Layers:**
1. **Component-Level**: `ProtectedRoute` wrapper components
2. **State-Level**: Redux authentication state management
3. **Navigation-Level**: Automatic redirections with URL preservation
4. **UX-Level**: Loading states and smooth transitions

### Component Hierarchy