import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { createAuctionListingFromFile } from "../functions/create-auction-listing-from-file/resource";
import { queryData } from "../functions/query-data/resource";
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
      allow.publicApiKey().to(["create", "read"]),
      // Restrict other operations to admin users only
      // This ensures only authorized users can update, or delete records
    ]),

  queryData: a
    .query()
    .arguments({
      modelName: a.string(),
      operation: a.string(),
      query: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(queryData)),

  createAuctionListingFromFile: a
    .query()
    .arguments({
      listingDetailsFileKey: a.string().required(),
      manifestFileKey: a.string().required(),
      sellerId: a.string(),
      sellerProfileId: a.string(),
      cognitoId: a.string(),
      visibility: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(createAuctionListingFromFile)),
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
