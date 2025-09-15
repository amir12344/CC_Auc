import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import type { Schema } from "@/amplify/data/resource";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";

// User profile type based on database schema
export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  user_type: string;
  company: string | null;
  title: string | null;
  job_title: string | null;
  date_of_birth: string | null;
}

export interface ShippingAddress {
  addressType: "DEFAULT";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

export interface BillingAddress {
  addressType: "BILLING";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

export interface UserVerificationStatus {
  verification_status: string | null;
  account_locked: boolean;
  user_id: string;
}

export const fetchBuyerDetails = async (): Promise<UserProfile[]> => {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });
    const currentUser = await getCurrentUser();

    type QueryDataInput = {
      modelName: "users";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"users"> = {
      relationLoadStrategy: "join",
      where: {
        cognito_id: currentUser.userId,
      },
      select: {
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        date_of_birth: true,
        title: true,
        user_type: true,
        job_title: true,
        company: true,
      },
      take: 10,
    };

    const input: QueryDataInput = {
      modelName: "users",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        return parsedData as UserProfile[];
      }
    }

    return [];
  } catch (_error) {
    // Silent error handling - return empty array
    return [];
  }
};

export const updateUserProfile = async (profileData: {
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: string;
  company?: string;
  title?: string;
  jobTitle?: string;
  dateOfBirth?: Date;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    // Use the createUser function from the schema which handles both create and update
    const { data: result, errors } = await client.queries.createUser({
      username: profileData.username,
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      userType: profileData.userType as "BUYER" | "SELLER" | "BUYER_AND_SELLER",
      company: profileData.company,
      title:
        profileData.title && profileData.title.trim() !== ""
          ? profileData.title
          : undefined,
      jobTitle: profileData.jobTitle,
      dateOfBirth: profileData.dateOfBirth?.toISOString(),
    });

    // Handle GraphQL errors first
    if (errors) {
      return { success: false, error: JSON.stringify(errors) };
    }

    // Parse the result to check for backend success/error response
    if (result) {
      const parsedResult =
        typeof result === "string" ? JSON.parse(result) : result;

      // Check if the parsed result has a success field
      if (
        typeof parsedResult === "object" &&
        parsedResult !== null &&
        "success" in parsedResult
      ) {
        if (parsedResult.success === false) {
          // Return the error object directly so formatBackendError can handle it properly
          return { success: false, error: parsedResult.error };
        }
        return { success: true };
      }

      // If no success field, assume success if we got a result
      return { success: true };
    }

    return { success: false, error: "No response received from server" };
  } catch (_error) {
    return {
      success: false,
      error: "An error occurred while updating profile",
    };
  }
};

export const createShippingAddress = async (
  addressData: ShippingAddress
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    const { data: result, errors } = await client.queries.addUserAddress({
      address: addressData,
    });

    if (errors) {
      return { success: false, error: JSON.stringify(errors) };
    }

    if (result) {
      const parsedResult =
        typeof result === "string" ? JSON.parse(result) : result;

      if (
        typeof parsedResult === "object" &&
        parsedResult !== null &&
        "success" in parsedResult
      ) {
        if (parsedResult.success === false) {
          return { success: false, error: parsedResult.error };
        }
        return { success: true };
      }

      return { success: true };
    }

    return { success: false, error: "No response received from server" };
  } catch (_error) {
    return {
      success: false,
      error: "An error occurred while adding shipping address",
    };
  }
};

export const fetchShippingAddress = async (): Promise<{
  data: ShippingAddress | null;
  error?: string;
}> => {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });
    const currentUser = await getCurrentUser();

    type QueryDataInput = {
      modelName: "users";
      operation: "findFirst";
      query: string;
    };

    const query: FindManyArgs<"users"> = {
      relationLoadStrategy: "join",
      where: {
        cognito_id: currentUser.userId,
      },
      select: {
        user_addresses: {
          select: {
            addresses: {
              select: {
                first_name: true,
                last_name: true,
                company: true,
                address1: true,
                address2: true,
                address3: true,
                city: true,
                province: true,
                province_code: true,
                country: true,
                country_code: true,
                zip: true,
                phone: true,
              },
            },
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "users",
      operation: "findFirst",
      query: JSON.stringify(query),
    };

    const { data: result, errors } = await client.queries.queryData(input);

    if (errors) {
      return { data: null, error: JSON.stringify(errors) };
    }

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      // Check if user_addresses is an array and has at least one element
      const userAddresses = parsedData?.user_addresses;
      if (Array.isArray(userAddresses) && userAddresses.length > 0) {
        const addr = userAddresses[0]?.addresses;
        if (addr) {
          return {
            data: {
              addressType: "DEFAULT",
              firstName: addr.first_name,
              lastName: addr.last_name,
              company: addr.company,
              address1: addr.address1,
              address2: addr.address2,
              address3: addr.address3,
              city: addr.city,
              province: addr.province,
              provinceCode: addr.province_code,
              country: addr.country,
              countryCode: addr.country_code,
              zip: addr.zip,
              phone: addr.phone,
            } as ShippingAddress,
            error: undefined,
          };
        }
      }
      // Fallback: check if user_addresses is a single object (not array)
      else if (parsedData?.user_addresses?.addresses) {
        const addr = parsedData.user_addresses.addresses;
        return {
          data: {
            addressType: "DEFAULT",
            firstName: addr.first_name,
            lastName: addr.last_name,
            company: addr.company,
            address1: addr.address1,
            address2: addr.address2,
            address3: addr.address3,
            city: addr.city,
            province: addr.province,
            provinceCode: addr.province_code,
            country: addr.country,
            countryCode: addr.country_code,
            zip: addr.zip,
            phone: addr.phone,
          } as ShippingAddress,
          error: undefined,
        };
      }
    }

    return { data: null, error: undefined };
  } catch (_error) {
    return { data: null, error: "Failed to fetch shipping address" };
  }
};

export const createBillingAddress = async (
  addressData: BillingAddress
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    const { data: result, errors } = await client.queries.addUserAddress({
      address: addressData,
    });

    if (errors) {
      return { success: false, error: JSON.stringify(errors) };
    }

    if (result) {
      const parsedResult =
        typeof result === "string" ? JSON.parse(result) : result;

      if (
        typeof parsedResult === "object" &&
        parsedResult !== null &&
        "success" in parsedResult
      ) {
        if (parsedResult.success === false) {
          return { success: false, error: parsedResult.error };
        }
        return { success: true };
      }

      return { success: true };
    }

    return { success: false, error: "No response received from server" };
  } catch (_error) {
    return {
      success: false,
      error: "An error occurred while adding billing address",
    };
  }
};

export const fetchBillingAddress = async (): Promise<{
  data: BillingAddress | null;
  error?: string;
}> => {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });
    const currentUser = await getCurrentUser();

    type QueryDataInput = {
      modelName: "users";
      operation: "findFirst";
      query: string;
    };

    const query: FindManyArgs<"users"> = {
      relationLoadStrategy: "join",
      where: {
        cognito_id: currentUser.userId,
      },
      select: {
        user_addresses: {
          where: {
            address_type: "BILLING",
          },
          select: {
            addresses: {
              select: {
                first_name: true,
                last_name: true,
                company: true,
                address1: true,
                address2: true,
                address3: true,
                city: true,
                province: true,
                province_code: true,
                country: true,
                country_code: true,
                zip: true,
                phone: true,
              },
            },
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "users",
      operation: "findFirst",
      query: JSON.stringify(query),
    };

    const { data: result, errors } = await client.queries.queryData(input);

    if (errors) {
      return { data: null, error: JSON.stringify(errors) };
    }
    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      // Since we already filter by address_type in the query, just take the first one
      const userAddresses = parsedData?.user_addresses;
      if (Array.isArray(userAddresses) && userAddresses.length > 0) {
        const addr = userAddresses[0]?.addresses;
        if (addr) {
          return {
            data: {
              addressType: "BILLING",
              firstName: addr.first_name,
              lastName: addr.last_name,
              company: addr.company,
              address1: addr.address1,
              address2: addr.address2,
              address3: addr.address3,
              city: addr.city,
              province: addr.province,
              provinceCode: addr.province_code,
              country: addr.country,
              countryCode: addr.country_code,
              zip: addr.zip,
              phone: addr.phone,
            } as BillingAddress,
            error: undefined,
          };
        }
      }
      // Fallback: check if user_addresses is a single object
      else if (parsedData?.user_addresses?.addresses) {
        const addr = parsedData.user_addresses.addresses;
        return {
          data: {
            addressType: "BILLING",
            firstName: addr.first_name,
            lastName: addr.last_name,
            company: addr.company,
            address1: addr.address1,
            address2: addr.address2,
            address3: addr.address3,
            city: addr.city,
            province: addr.province,
            provinceCode: addr.province_code,
            country: addr.country,
            countryCode: addr.country_code,
            zip: addr.zip,
            phone: addr.phone,
          } as BillingAddress,
          error: undefined,
        };
      }
    }

    return { data: null, error: undefined };
  } catch (_error) {
    return { data: null, error: "Failed to fetch billing address" };
  }
};

// Queries Prisma via Amplify client; normalizes verification_status to lowercase
export const fetchUserVerificationStatus = async (
  userId?: string
): Promise<{
  data: UserVerificationStatus | null;
  error?: string;
}> => {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });
    let cognitoId = userId;

    if (!cognitoId) {
      try {
        const currentUser = await getCurrentUser();
        cognitoId = currentUser.userId;
      } catch (e) {
        // User is not authenticated, which is a valid state for client-side checks.
        return { data: null, error: "User not authenticated" };
      }
    }

    if (!cognitoId) {
      return { data: null, error: "User ID not provided or found" };
    }

    type QueryDataInput = {
      modelName: "users";
      operation: "findFirst";
      query: string;
    };

    const query: FindManyArgs<"users"> = {
      relationLoadStrategy: "join",
      where: {
        cognito_id: cognitoId,
      },
      select: {
        public_id: true,
        account_locked: true,
        buyer_profiles: {
          select: {
            verification_status: true,
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "users",
      operation: "findFirst",
      query: JSON.stringify(query),
    };

    const { data: result, errors } = await client.queries.queryData(input);

    if (errors) {
      return { data: null, error: JSON.stringify(errors) };
    }

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (parsedData && typeof parsedData === "object") {
        const rawStatus =
          parsedData.buyer_profiles?.verification_status || null;
        const normalizedStatus = (
          rawStatus ? String(rawStatus).toLowerCase() : null
        ) as UserVerificationStatus["verification_status"];

        return {
          data: {
            verification_status: normalizedStatus,
            account_locked: Boolean(parsedData.account_locked),
            user_id: parsedData.public_id,
          } as UserVerificationStatus,
          error: undefined,
        };
      }
    }

    return { data: null, error: undefined };
  } catch (_error) {
    return { data: null, error: "Failed to fetch user verification status" };
  }
};
