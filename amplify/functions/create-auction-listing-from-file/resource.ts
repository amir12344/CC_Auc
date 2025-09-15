import { defineFunction, secret } from "@aws-amplify/backend";

export const createAuctionListingFromFile = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "create-auction-listing-from-file",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  environment: {
    DB_CONNECTION_DETAILS: secret("db_connection_details"),
    // Add these placeholder values - they'll be overridden in backend.ts
    COMPLETE_AUCTION_FUNCTION_ARN: "placeholder",
    EVENTBRIDGE_SCHEDULER_ROLE_ARN: "placeholder",
    AUCTION_DLQ_ARN: "placeholder",
    SCHEDULE_GROUP_NAME: "placeholder",
  },
  timeoutSeconds: 900,
  memoryMB: 512,
});
