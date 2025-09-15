import { defineFunction, secret } from "@aws-amplify/backend";

export const webSocketDisconnect = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: "websocket-disconnect",
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: "./handler.ts",
  environment: {
    DB_CONNECTION_DETAILS: secret("db_connection_details"),
  },
  timeoutSeconds: 120,
  memoryMB: 256,
});
