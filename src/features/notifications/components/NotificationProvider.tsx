"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import type { Schema } from "../../../../amplify/data/resource";
import type { FindManyArgs } from "../../../lib/prisma/PrismaQuery.type";
import {
  selectIsAuthenticated,
  selectUserProfile,
} from "../../authentication/store/authSelectors";
import { useNotificationSubscription } from "../hooks/useNotificationSubscription";
import { NotificationSheet } from "./NotificationSheet";

let client: ReturnType<typeof generateClient<Schema>> | null = null;

// Initialize client with error handling
try {
  client = generateClient<Schema>();
} catch (error) {
  // Client initialization failed - will be handled gracefully
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const userProfile = useSelector(selectUserProfile);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  // Function to fetch internal user ID using the correct pattern from existing services
  const fetchInternalUserId = async (): Promise<string | null> => {
    try {
      // Get current Cognito user
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        return null;
      }

      // Query users table to get internal user_id (matches existing service pattern)
      type QueryDataInput = {
        modelName: "users";
        operation: "findMany";
        query: string;
      };

      const query: FindManyArgs<"users"> = {
        where: {
          cognito_id: currentUser.userId,
        },
        select: {
          user_id: true, // Only fetch the user_id field
        },
        take: 1, // We only need one result
      };

      const input: QueryDataInput = {
        modelName: "users",
        operation: "findMany",
        query: JSON.stringify(query),
      };

      if (!client) {
        return null;
      }

      const { data: result } = await client.queries.queryData(input);

      if (result) {
        const parsedData =
          typeof result === "string" ? JSON.parse(result) : result;
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const internalId = parsedData[0]?.user_id;
          return internalId || null;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Fetch internal user ID when user is authenticated
  useEffect(() => {
    const fetchUserId = async () => {
      if (isAuthenticated) {
        const fetchedUserId = await fetchInternalUserId();
        setInternalUserId(fetchedUserId);
      } else {
        setInternalUserId(null);
      }
    };

    fetchUserId();
  }, [isAuthenticated]);

  // Set up notification subscription using internal user ID
  const { subscriptionActive } = useNotificationSubscription(
    internalUserId // Pass internal user_id instead of Cognito ID
  );

  return (
    <>
      {children}
      <NotificationSheet />
    </>
  );
};
