# Protected Routes - Quick Reference Guide

## 🚀 Quick Start

### **Protect a New Page**
```typescript
// Any new buyer page
export default function NewBuyerPage() {
  return (
    <BuyerProtectedRoute>
      {/* Your page content here */}
    </BuyerProtectedRoute>
  );
}
```

### **Protect a Layout**
```typescript
// Layout that should protect all child pages
export default function ProtectedLayout({ children }) {
  return (
    <BuyerProtectedRoute>
      <div className="layout-container">
        {children}
      </div>
    </BuyerProtectedRoute>
  );
}
```

## 📋 Available Components

### **Import Statement**
```typescript
import { 
  BuyerProtectedRoute, 
  SellerProtectedRoute, 
  AuthenticatedRoute 
} from '@/src/components/auth/ProtectedRoute';
```

### **Component Options**
- `<BuyerProtectedRoute>` - Buyer-only access
- `<SellerProtectedRoute>` - Seller-only access  
- `<AuthenticatedRoute>` - Any authenticated user

## 🔧 Implementation Examples

### **Buyer Page Protection**
```typescript
// src/app/buyer/new-feature/page.tsx
import { BuyerProtectedRoute } from '@/src/components/auth/ProtectedRoute';

export default function NewFeaturePage() {
  return (
    <BuyerProtectedRoute>
      <div>
        <h1>New Buyer Feature</h1>
        {/* Protected content */}
      </div>
    </BuyerProtectedRoute>
  );
}
```

### **Seller Page Protection**
```typescript
// src/app/seller/dashboard/page.tsx
import { SellerProtectedRoute } from '@/src/components/auth/ProtectedRoute';

export default function SellerDashboard() {
  return (
    <SellerProtectedRoute>
      <div>
        <h1>Seller Dashboard</h1>
        {/* Protected content */}
      </div>
    </SellerProtectedRoute>
  );
}
```

### **Any User Protection**
```typescript
// src/app/profile/page.tsx
import { AuthenticatedRoute } from '@/src/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <AuthenticatedRoute>
      <div>
        <h1>User Profile</h1>
        {/* Content for any authenticated user */}
      </div>
    </AuthenticatedRoute>
  );
}
```

## ⚡ Key Features

### **Automatic Behavior**
- ✅ **Unauthenticated users** → Redirected to `/auth/login?returnUrl=<current-page>`
- ✅ **Wrong role** → Redirected to appropriate dashboard
- ✅ **After login** → Returned to originally intended page
- ✅ **After logout** → Protected content inaccessible

### **Loading States**
- Shows spinner during authentication checks
- Prevents flash of wrong content
- Hydration-safe (no server/client mismatch)

### **Error Handling**
- Graceful fallbacks for auth failures
- Console logging for debugging
- Automatic retry mechanisms

## 🛠️ Troubleshooting

### **Common Issues**

**Issue**: Hydration mismatch errors
**Solution**: Always use the wrapper components, never try to implement auth checks directly in render

**Issue**: Users can still access protected content
**Solution**: Make sure you're wrapping the entire page content, not just a part of it

**Issue**: Redirect loops
**Solution**: Check that your login page doesn't have authentication protection

### **Debug Checklist**
1. ✅ Wrapped entire page content with protection component
2. ✅ Using correct protection type (Buyer/Seller/Authenticated)
3. ✅ Login page supports `returnUrl` parameter
4. ✅ Redux authentication state is working
5. ✅ No nested protection components

## 📱 Mobile Considerations

The protection components work seamlessly on mobile with:
- Touch-friendly loading states
- Proper viewport handling
- Responsive redirect flows

## 🔄 Migration from Old HOC

### **Old Way (Deprecated)**
```typescript
// DON'T USE - Deprecated
export default withBuyerAuth(Component);
```

### **New Way (Current)**
```typescript
// USE THIS - Current approach
export default function Page() {
  return (
    <BuyerProtectedRoute>
      <Component />
    </BuyerProtectedRoute>
  );
}
```

## 📚 Related Files

- **Core Component**: `src/components/auth/ProtectedRoute.tsx`
- **Auth Selectors**: `src/features/authentication/store/authSelectors.ts`
- **Login Page**: `src/app/auth/login/page.tsx`
- **User Dropdown**: `src/components/layout/UserDropdown.tsx`

## 🎯 Best Practices

1. **Always wrap at the top level** of your page/layout
2. **Use the most specific protection** (BuyerProtectedRoute vs AuthenticatedRoute)
3. **Don't nest protection components**
4. **Test both authenticated and unauthenticated flows**
5. **Verify return URL behavior** after implementing

---

**Need Help?** Check the full implementation guide: `PROTECTED_ROUTES_IMPLEMENTATION.md` 