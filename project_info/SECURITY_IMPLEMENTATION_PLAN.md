# Commerce Central Security Implementation Plan

## 🎯 Amplify-Based Security Implementation

### **Current Architecture Constraints:**
- ✅ **AWS Amplify/Cognito**: Full authentication management
- ✅ **Mock Data**: No backend yet, all data is mock except auth
- ✅ **Two Roles**: Only buyer and seller roles
- ❌ **No MFA Required**: Not implementing multi-factor authentication at this time

### **🚨 CRITICAL REQUIREMENT:**
**Buyers and sellers must NEVER be able to access each other's protected areas.**

### **Page Access Rules:**
```
PUBLIC (Anyone can access):
✅ /website/*              (All marketing pages)
✅ /website/buyer/*        (Public buyer marketing)
✅ /website/seller/*       (Public seller marketing) 
✅ /marketplace/*          (Public marketplace)
✅ /auth/*                (Authentication flows)
✅ / (homepage)           (Public homepage)

BUYERS ONLY (Sellers must be BLOCKED):
🔒 /buyer/deals/*
🔒 /buyer/account/*
🔒 /buyer/product/*

SELLERS ONLY (Buyers must be BLOCKED):
🔒 /seller/dashboard
🔒 /seller/listing/*
🔒 /seller/* (all future seller pages)
```

### **Phase 1: CRITICAL SECURITY FIXES** (Week 1-2) 🚨

**Priority**: PREVENT CROSS-ROLE ACCESS + Address fundamental authentication vulnerabilities.

#### **1.1 CRITICAL: Implement Cross-Role Access Prevention**
**Files**: `src/middleware.ts` + All protected routes
**Issue**: Buyers could potentially access seller pages and vice versa
**Risk**: Complete role-based security failure

**IMPLEMENT IMMEDIATELY:**
```typescript
// src/middleware.ts - STRICT role enforcement
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for PUBLIC pages (marketing, etc.)
  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }
  
  // CRITICAL: Enforce strict role-based access
  if (pathname.startsWith('/buyer') || pathname.startsWith('/seller')) {
    try {
      const userRole = await extractUserRoleFromAmplifyToken(request);
      
      // STRICT enforcement - buyers CANNOT access seller pages
      if (pathname.startsWith('/buyer') && userRole !== 'buyer') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // STRICT enforcement - sellers CANNOT access buyer pages  
      if (pathname.startsWith('/seller') && userRole !== 'seller') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
    } catch (error) {
      return redirectToLogin(request);
    }
  }
  
  return NextResponse.next();
}

// Helper: Identify public pages that don't need auth
function isPublicPage(pathname: string): boolean {
  const publicRoutes = [
    '/website/',      // All marketing pages
    '/marketplace/',  // Public marketplace
    '/auth/',         // Authentication flows
    '/',              // Homepage
  ];
  
  return publicRoutes.some(route => pathname.startsWith(route));
}
```

#### **1.2 Create Unauthorized Access Page**
**File**: `src/app/unauthorized/page.tsx` (CREATE NEW)
**Issue**: Need clear page for cross-role access violations

```typescript
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this area.
        </p>
        <Link href="/" className="btn btn-primary mt-4">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
```

#### **1.3 Fix Seller Listing Page Authentication** 
**File**: `src/app/seller/listing/[id]/page.tsx`
**Issue**: Using deprecated `withAuth` HOC instead of current `SellerProtectedRoute` pattern
**Impact**: Inconsistent security patterns across seller pages

```typescript
// CURRENT (Deprecated):
export default withAuth(SellerListingPage, { 
  allowedUserTypes: ['seller'],
  redirectTo: '/auth/login'
});

// REPLACE WITH (Current Pattern):
export default function SellerListingPageWrapper() {
  return (
    <SellerProtectedRoute>
      <SellerListingPage />
    </SellerProtectedRoute>
  );
}
```

#### **1.2 Implement Amplify Token Validation in Middleware**
**Issue**: All authentication is client-side only (can be bypassed by disabling JS)
**Solution**: Add Amplify session validation to `src/middleware.ts`

```typescript
// NEW: Enhanced middleware with auth protection
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/src/lib/auth/jwt-utils';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 1. URL normalization (existing functionality)
  const normalizedResponse = await normalizeURL(request);
  if (normalizedResponse) return normalizedResponse;
  
  // 2. NEW: Protect seller and buyer routes
  if (pathname.startsWith('/seller') || pathname.startsWith('/buyer')) {
    const authToken = request.cookies.get('amplify-auth-token')?.value;
    
    if (!authToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      const decoded = await verifyJWTToken(authToken);
      const userType = decoded['custom:userRole'];
      
      // Check route authorization
      if (pathname.startsWith('/seller') && userType !== 'seller') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/buyer') && userType !== 'buyer') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // Invalid token - redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}
```

#### **1.3 Verify Buyer Routes Protection**
**Issue**: Need to ensure buyer routes use consistent protection patterns
**Solution**: Audit all buyer routes for proper authentication patterns

```typescript
// NEW: Audit buyer route protection patterns
// Check all buyer routes for consistent protection

const buyerRoutes = [
  '/buyer/deals',           // ✅ Layout protected
  '/buyer/deals/all-deals', // ✅ Inherited protection
  '/buyer/deals/offers',    // ✅ Inherited protection  
  '/buyer/deals/orders',    // ✅ Inherited protection
  '/buyer/deals/messages',  // ✅ Inherited protection
  '/buyer/account',         // ✅ Component protected
  '/buyer/account/preferences', // ✅ Component protected
  '/buyer/product/[id]',    // ✅ Component protected
];

// All routes should use either:
// 1. Layout-level BuyerProtectedRoute (inherited)
// 2. Component-level BuyerProtectedRoute (explicit)

// UPDATE: Seller listing page with ownership validation
const SellerListingPage = () => {
  const params = useParams();
  const id = params.id as string;
  const hasAccess = useSellerListingAccess(id);
  
  if (hasAccess === false) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p>You don't have permission to access this listing.</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (hasAccess === null) {
    return <LoadingSpinner />;
  }
  
  // Render normal listing page
  return (
    // ... existing component code
  );
};
```

#### **1.4 Create API Route Protection Utilities**
```typescript
// NEW: src/lib/api/withAuth.ts
import { NextRequest } from 'next/server';
import { verifyJWTToken } from '@/src/lib/auth/jwt-utils';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    userType: 'buyer' | 'seller';
    email: string;
  };
}

export async function withAuth(
  request: NextRequest,
  requiredUserType?: 'buyer' | 'seller'
): Promise<{ user: any } | { error: string, status: number }> {
  try {
    const authToken = request.cookies.get('amplify-auth-token')?.value;
    
    if (!authToken) {
      return { error: 'Authentication required', status: 401 };
    }
    
    const decoded = await verifyJWTToken(authToken);
    const userType = decoded['custom:userRole'];
    
    if (requiredUserType && userType !== requiredUserType) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    
    return {
      user: {
        id: decoded.sub,
        userType,
        email: decoded.email
      }
    };
  } catch (error) {
    return { error: 'Invalid authentication', status: 401 };
  }
}
```

### **Phase 2: AUTHENTICATION IMPROVEMENTS** (Week 3-4) 🔒

#### **2.1 Security Headers Implementation**
**File**: `next.config.ts`
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

#### **2.2 Production Security Hardening**
**File**: Update production environment settings
```typescript
// src/lib/auth/config.ts
export const AUTH_CONFIG = {
  // Disable debug tools in production
  enableDevTools: process.env.NODE_ENV !== 'production',
  
  // Session timeout
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  
  // Rate limiting
  rateLimiting: {
    loginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  }
};
```

### **Phase 3: MONITORING & LOGGING** (Week 5-6) 📊

#### **3.1 Security Event Logging**
```typescript
// NEW: src/lib/security/logger.ts
interface SecurityEvent {
  type: 'auth_success' | 'auth_failure' | 'unauthorized_access' | 'suspicious_activity';
  userId?: string;
  userType?: 'buyer' | 'seller';
  ipAddress: string;
  userAgent: string;
  resource?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class SecurityLogger {
  static async logEvent(event: SecurityEvent) {
    // Log to CloudWatch or external service
    console.log('🔒 Security Event:', {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // In production, send to AWS CloudWatch
    if (process.env.NODE_ENV === 'production') {
      // await sendToCloudWatch(event);
    }
  }
  
  static async logAuthFailure(ipAddress: string, userAgent: string, reason: string) {
    await this.logEvent({
      type: 'auth_failure',
      ipAddress,
      userAgent,
      timestamp: new Date(),
      metadata: { reason }
    });
  }
  
  static async logUnauthorizedAccess(userId: string, resource: string, ipAddress: string) {
    await this.logEvent({
      type: 'unauthorized_access',
      userId,
      resource,
      ipAddress,
      userAgent: '',
      timestamp: new Date()
    });
  }
}
```

## 📋 Implementation Checklist

### **Week 1 - Critical Fixes**
- [ ] **Day 1**: Fix seller listing page authentication (1.1)
- [ ] **Day 2**: Implement server-side middleware protection (1.2)
- [ ] **Day 3**: Add listing ownership validation (1.3)
- [ ] **Day 4**: Create API protection utilities (1.4)
- [ ] **Day 5**: Test and validate all fixes

### **Week 2 - Security Hardening**
- [ ] **Day 1**: Add security headers (2.1)
- [ ] **Day 2**: Production security configuration (2.2)
- [ ] **Day 3**: Disable debug tools in production
- [ ] **Day 4**: Rate limiting implementation
- [ ] **Day 5**: Security testing

### **Week 3-4 - Advanced Features**
- [ ] **Week 3**: Security event logging (3.1)
- [ ] **Week 4**: Monitoring dashboard and compliance

## 🧪 Testing Strategy

### **Security Test Cases**

#### **Authentication Bypass Tests**
1. **JavaScript Disabled Test**
   - Disable JavaScript in browser
   - Attempt to access `/seller/dashboard`
   - Expected: Redirect to login page

2. **Direct URL Access Test**
   - Log out of application
   - Navigate directly to `/seller/listing/123`
   - Expected: Redirect to login with return URL

3. **Cross-Seller Access Test**
   - Login as Seller A
   - Attempt to access Seller B's listing
   - Expected: Access denied error

#### **Server-Side Protection Tests**
1. **Middleware Authentication Test**
   - Remove auth cookies
   - Make request to protected route
   - Expected: 401 Unauthorized

2. **Token Validation Test**
   - Use expired/invalid JWT token
   - Access protected resource
   - Expected: Token validation failure

## 🎯 Success Criteria

### **Phase 1 Success Metrics**
- [ ] All seller routes use consistent protection pattern
- [ ] Server-side authentication prevents JavaScript bypass
- [ ] Ownership validation prevents cross-seller access
- [ ] Zero authentication bypass vulnerabilities

### **Phase 2 Success Metrics**
- [ ] All security headers implemented
- [ ] Production debug tools disabled
- [ ] Rate limiting active on auth endpoints
- [ ] Security configuration hardened

### **Phase 3 Success Metrics**
- [ ] Comprehensive security logging active
- [ ] Failed authentication attempts tracked
- [ ] Unauthorized access attempts logged
- [ ] Security monitoring dashboard operational

## 🚨 Critical Security Notes

1. **Immediate Actions Required**:
   - Update seller listing page authentication pattern
   - Implement server-side route protection
   - Add ownership validation to prevent data access issues

2. **Production Deployment**:
   - Ensure debug tools are disabled
   - Verify security headers are active
   - Test authentication flows thoroughly

3. **Ongoing Monitoring**:
   - Review security logs regularly
   - Monitor for suspicious activity patterns
   - Update security measures as needed

---

**Document Status**: 🔴 URGENT IMPLEMENTATION REQUIRED  
**Owner**: Security Team / Lead Developer  
**Review Schedule**: Weekly during implementation  
**Last Updated**: December 2024 