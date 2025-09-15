# Role-Specific Signup Fields Strategy

## ✅ **Solution: Custom Attributes by Role**

You're absolutely right! Buyers and sellers need different fields. Here's how to implement this properly using **role-specific custom attributes**.

## 🏗️ **Architecture Overview**

### **Single Auth Resource with Role-Specific Attributes**
```
Amplify Auth Resource
├── Standard Attributes (shared)
│   ├── email
│   ├── phoneNumber  
│   └── fullname (name)
├── Buyer-Specific Attributes
│   ├── custom:jobTitle
│   └── custom:companyName
├── Seller-Specific Attributes
│   ├── custom:businessType
│   ├── custom:businessSize
│   ├── custom:yearsInBusiness
│   └── custom:primaryProducts
└── Shared Attributes
    ├── custom:userRole
    └── custom:termsAccepted
```

## 📋 **Example Field Structures**

### **Buyer Signup Fields (Current - Working)**
1. **Name** (fullname) - "John Doe"
2. **Job Title** (custom:jobTitle) - "Purchasing Manager" 
3. **Company Name** (custom:companyName) - "ABC Corp"
4. **Email** (email) - Required
5. **Phone** (phoneNumber) - Required
6. **Password** - Required

### **Seller Signup Fields (Example)**
1. **Name** (fullname) - "Jane Smith"
2. **Business Type** (custom:businessType) - "Manufacturer", "Distributor", "Retailer"
3. **Business Size** (custom:businessSize) - "1-10", "11-50", "51-200", "200+"
4. **Years in Business** (custom:yearsInBusiness) - "0-1", "2-5", "6-10", "10+"
5. **Primary Products** (custom:primaryProducts) - "Electronics", "Clothing", etc.
6. **Email** (email) - Required
7. **Phone** (phoneNumber) - Required  
8. **Password** - Required

## 🔧 **Implementation Steps**

### **Step 1: Update Auth Resource** ✅ DONE
Added seller-specific custom attributes to `amplify/auth/resource.ts`

### **Step 2: Update Seller Signup Form**
```typescript
// Seller signup schema example
const sellerSignupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  businessType: z.string().min(1, { message: 'Business type is required' }),
  businessSize: z.string().min(1, { message: 'Business size is required' }),
  yearsInBusiness: z.string().min(1, { message: 'Years in business is required' }),
  primaryProducts: z.string().min(1, { message: 'Primary products is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions',
  }),
});
```

### **Step 3: Update Seller API Call**
```typescript
const { isSignUpComplete, userId, nextStep } = await signUp({
  username: data.email,
  password: data.password,
  options: {
    userAttributes: {
      email: data.email,
      name: data.name,
      phone_number: formattedPhoneNumber,
      "custom:businessType": data.businessType,
      "custom:businessSize": data.businessSize,
      "custom:yearsInBusiness": data.yearsInBusiness,
      "custom:primaryProducts": data.primaryProducts,
      "custom:userRole": "seller",
      "custom:termsAccepted": data.termsAccepted.toString()
    },
    autoSignIn: true
  }
});
```

### **Step 4: Update TypeScript Interfaces**
```typescript
// Update UserProfile interface
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: 'buyer' | 'seller';
  phoneNumber?: string;
  
  // Buyer-specific fields
  jobTitle?: string;
  companyName?: string;
  
  // Seller-specific fields
  businessType?: string;
  businessSize?: string;
  yearsInBusiness?: string;
  primaryProducts?: string;
  
  termsAccepted: boolean;
  // ... rest of fields
}
```

### **Step 5: Update Auth Store Logic**
```typescript
// In transformAmplifyUserToProfile function
return {
  // ... shared fields
  
  // Buyer-specific fields
  jobTitle: attributes['custom:jobTitle'],
  companyName: attributes['custom:companyName'],
  
  // Seller-specific fields  
  businessType: attributes['custom:businessType'],
  businessSize: attributes['custom:businessSize'],
  yearsInBusiness: attributes['custom:yearsInBusiness'],
  primaryProducts: attributes['custom:primaryProducts'],
  
  // ... rest of fields
};
```

## ✨ **Benefits of This Approach**

### **✅ Flexibility**
- Each role gets exactly the fields they need
- Easy to add more role-specific fields later
- No unused fields cluttering the form

### **✅ Maintainability** 
- Single auth resource manages all attributes
- Clear separation between buyer/seller fields
- Easy to extend for new user types

### **✅ Data Quality**
- Role-appropriate validation rules
- Business-relevant information capture
- Better user experience with relevant fields

## 🎯 **Customization Examples**

### **If You Want Different Seller Fields:**
```typescript
// Alternative seller fields
"custom:industry": "Manufacturing", "Technology", "Healthcare"
"custom:revenue": "<1M", "1M-10M", "10M-100M", "100M+"
"custom:territory": "Local", "Regional", "National", "International"
"custom:specialization": "Liquidation", "Surplus", "Closeouts"
```

### **If You Want Fewer Seller Fields:**
```typescript
// Minimal seller fields
"custom:businessType": "Required - type of business"
"custom:companySize": "Optional - company size"
// Use name, email, phone, password (4-6 total fields)
```

## 🚀 **Next Steps**

1. **Define exact seller fields** you want (I used examples above)
2. **Update seller signup form** with new field structure  
3. **Update seller signup API** to use custom attributes
4. **Test both buyer and seller flows**
5. **Deploy and monitor**

## 💡 **Key Principle**

**Each role gets the attributes they need, stored in the same user pool but with different custom attribute names.** This gives you maximum flexibility while maintaining a single authentication system.

Would you like me to implement the seller signup updates with your specific field requirements? 