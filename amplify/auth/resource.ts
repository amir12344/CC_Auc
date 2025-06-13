// import { defineAuth } from '@aws-amplify/backend'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
// export const auth = defineAuth({
//   loginWith: {
//     email: true,
//   },
//   userAttributes: {
//     // Standard attributes (use camelCase keys)
//     email: {
//       mutable: false,
//       required: true,
//     },
//     phoneNumber: {
//       // Maps to Cognito's phone_number
//       mutable: true,
//       required: false,
//     },

//     // === SHARED CUSTOM ATTRIBUTES ===
//     'custom:fullName': {
//       dataType: 'String', // Full name for both buyers and sellers
//       mutable: true,
//     },

//     // === BUYER-SPECIFIC CUSTOM ATTRIBUTES ===
//     'custom:jobTitle': {
//       dataType: 'String',
//       mutable: true,
//     },
//     'custom:companyName': {
//       dataType: 'String',
//       mutable: true,
//     },

//     // === SELLER-SPECIFIC CUSTOM ATTRIBUTES ===
//     'custom:userRole': {
//       dataType: 'String', // 'buyer' or 'seller'
//       mutable: true,
//     },
//     'custom:termsAccepted': {
//       dataType: 'String', // Store as 'true'/'false' string
//       mutable: true,
//     },

//     // === SELLER CERTIFICATE ATTRIBUTES ===
//     'custom:hasCert': {
//       dataType: 'String', // Store as 'true'/'false' string
//       mutable: true,
//     },
//     'custom:certPaths': {
//       dataType: 'String', // Store comma-separated file paths
//       mutable: true,
//     },
//     'custom:certUploadDate': {
//       dataType: 'String', // Store ISO date string
//       mutable: true,
//     },
//     'custom:certStatus': {
//       dataType: 'String', // 'pending', 'approved', 'rejected'
//       mutable: true,
//     },
//   },
// })
