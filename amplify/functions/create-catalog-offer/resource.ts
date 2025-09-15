import { defineFunction, secret } from "@aws-amplify/backend";

export const createCatalogOffer = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "create-catalog-offer",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  environment: {
    DB_CONNECTION_DETAILS: secret("db_connection_details"),
    // Add these placeholder values - they'll be overridden in backend.ts
    NOTIFICATION_TOPIC_ARN: "placeholder",
  },
  timeoutSeconds: 900,
  memoryMB: 512,
});
