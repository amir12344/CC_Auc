import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";

// TypeScript interfaces for type safety
export interface CreateUserInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "BUYER" | "SELLER";
  company: string;
  jobTitle: string;
  phone: string;
  title?: string;
  dateOfBirth?: string;
}

export interface CreateUserResponse {
  data: unknown;
  errors: unknown;
}

export interface CreateSellerProfileResponse {
  data: unknown;
  errors: unknown;
}

export interface CreateBuyerProfileResponse {
  data: unknown;
  errors: unknown;
}

/**
 * Create a new user in the system
 * Follows the same pattern as submitCatalogOffer in catalogQueryService.ts
 */
export const createUser = async (
  userData: CreateUserInput
): Promise<CreateUserResponse> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    const { data: result, errors: createErrors } =
      await client.queries.createUser({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
        company: userData.company,
        title:
          userData.title && userData.title.trim() !== ""
            ? userData.title
            : undefined,
        jobTitle: userData.jobTitle,
        dateOfBirth:
          userData.dateOfBirth && userData.dateOfBirth.trim() !== ""
            ? userData.dateOfBirth
            : undefined,
        phone: userData.phone,
      });

    return { data: result, errors: createErrors };
  } catch (error) {
    // Error handled by returning null data
    return { data: null, errors: error };
  }
};

export const createSellerProfile =
  async (): Promise<CreateSellerProfileResponse> => {
    try {
      const client = generateClient<Schema>({ authMode: "userPool" });

      const { data: result, errors: createErrors } =
        await client.queries.createSellerProfile({});

      return { data: result, errors: createErrors };
    } catch (error) {
      // Error handled by returning null data
      return { data: null, errors: error };
    }
  };

/**
 * Create buyer profile with no data as per boss instruction
 */
export const createBuyerProfile =
  async (): Promise<CreateBuyerProfileResponse> => {
    try {
      const client = generateClient<Schema>({ authMode: "userPool" });

      const { data: result, errors: createErrors } =
        await client.queries.createBuyerProfile({});

      return { data: result, errors: createErrors };
    } catch (error) {
      // Error handled by returning null data
      return { data: null, errors: error };
    }
  };

/**
 * Helper function to split full name into first and last name
 */
export const splitFullName = (
  fullName: string
): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return { firstName, lastName };
};
