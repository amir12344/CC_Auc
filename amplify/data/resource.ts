import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*
 * Define an EarlyAccessRegistration model for storing early access form submissions
 * This model replaces the Todo example and is configured for public access
 * to allow unauthenticated users to submit the form
 */
const schema = a.schema({
  EarlyAccessRegistration: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      companyName: a.string(),
      email: a.string().required(),
      phoneNumber: a.string(),
      termsAccepted: a.boolean().required(),
      registrationDate: a.datetime().required(),
    })
    .authorization((allow) => [
      // Allow public access for creating and reading records
      allow.publicApiKey().to(['create', 'read']),
      // Restrict other operations to admin users only
      // This ensures only authorized users can update, or delete records
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
