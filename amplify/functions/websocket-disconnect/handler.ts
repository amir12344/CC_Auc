import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";

import { env } from "$amplify/env/websocket-disconnect";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";

import { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;

  console.log(`WebSocket disconnect attempt - ConnectionId: ${connectionId}`);

  try {
    // Use Amplify client to delete WebSocket connection record
    const { data, errors } = await client.models.WebSocketConnection.delete({
      id: connectionId, // Use id field instead of connectionId
    });

    if (errors) {
      console.error("Error removing WebSocket connection:", errors);
      return {
        statusCode: 500,
        body: "Failed to remove connection",
      };
    }

    console.log(`WebSocket connection removed: ${connectionId}`);

    return {
      statusCode: 200,
      body: "Disconnected",
    };
  } catch (error) {
    console.error("Error removing WebSocket connection:", error);
    return {
      statusCode: 500,
      body: "Failed to remove connection",
    };
  }
};
