import { env } from "$amplify/env/add-user-address";
import { AppSyncIdentityCognito } from "aws-lambda";
import { Country, State } from "country-state-city";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { UserDatabaseOperations } from "../commons/operations/users/UserDatabaseOperations";
import { UserOperations } from "../commons/operations/users/UserOperations";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["addUserAddress"]["functionHandler"] = async (
  event,
  context
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const cognitoId = (event.identity as AppSyncIdentityCognito).sub;

  try {
    // Initialize database connection
    const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
      env.DB_CONNECTION_DETAILS
    );
    const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

    const prismaClient = (await importModuleFromLayer())?.prismaClient(
      prismaDataSourceUrl
    )!;

    if (!prismaClient) {
      throw new Error("Failed to initialize database connection");
    }

    // Extract and validate arguments
    const { address } = event.arguments;

    let {
      addressType,
      firstName,
      lastName,
      company,
      address1,
      address2,
      address3,
      city,
      province,
      provinceCode,
      country,
      countryCode,
      zip,
      phone,
    } = address;

    // Auto-set countryCode from country name if missing
    if (country && !countryCode) {
      const countryData = Country.getAllCountries().find(
        (c) =>
          c.name.toLowerCase() === country.toLowerCase() ||
          c.name.toLowerCase().includes(country.toLowerCase()) ||
          country.toLowerCase().includes(c.name.toLowerCase())
      );
      if (countryData) {
        countryCode = countryData.isoCode;
      }
    }

    // Auto-set provinceCode from province name if missing (requires countryCode)
    if (province && !provinceCode && countryCode) {
      const stateData = State.getStatesOfCountry(countryCode).find(
        (s) =>
          s.name.toLowerCase() === province.toLowerCase() ||
          s.name.toLowerCase().includes(province.toLowerCase()) ||
          province.toLowerCase().includes(s.name.toLowerCase())
      );
      if (stateData) {
        provinceCode = stateData.isoCode;
      }
    }

    if (!cognitoId || cognitoId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    // Validate required fields
    const validationErrors = [];

    if (
      !addressType ||
      !["DEFAULT", "SHIPPING", "BILLING"].includes(addressType)
    ) {
      validationErrors.push({
        field: "addressType",
        message: "Address type must be one of: DEFAULT, SHIPPING, BILLING",
      });
    }

    // firstName and lastName are optional in the Address type, so no validation needed

    if (!address1 || address1.trim() === "") {
      validationErrors.push({
        field: "address1",
        message: "Address line 1 is required",
      });
    }

    if (!city || city.trim() === "") {
      validationErrors.push({
        field: "city",
        message: "City is required",
      });
    }

    if (!province || province.trim() === "") {
      validationErrors.push({
        field: "province",
        message: "Province/State is required",
      });
    }

    // provinceCode is optional in the Address type, so no validation needed

    if (!country || country.trim() === "") {
      validationErrors.push({
        field: "country",
        message: "Country is required",
      });
    }

    // countryCode is optional in the Address type, so no validation needed

    if (!zip || zip.trim() === "") {
      validationErrors.push({
        field: "zip",
        message: "ZIP/Postal code is required",
      });
    }

    if (validationErrors.length > 0) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: validationErrors,
        },
      });
    }

    // Validate phone format if provided
    if (phone && phone.trim() !== "") {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid phone format",
            details: [
              {
                field: "phone",
                message: "Phone number format is invalid",
              },
            ],
          },
        });
      }
    }

    // Validate country code format (if provided)
    if (countryCode && countryCode.length !== 2) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid country code format",
          details: [
            {
              field: "countryCode",
              message: "Country code must be 2 characters (ISO 3166-1 alpha-2)",
            },
          ],
        },
      });
    }

    // Validate province code format (if provided)
    if (provinceCode && (provinceCode.length < 2 || provinceCode.length > 3)) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid province code format",
          details: [
            {
              field: "provinceCode",
              message: "Province code must be 2-3 characters",
            },
          ],
        },
      });
    }

    // Initialize database operations
    const dbOps = new UserDatabaseOperations(prismaClient);

    // Get user by Cognito ID
    const user = await dbOps.getUserByCognitoId(cognitoId);
    if (!user) {
      return JSON.stringify({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found for the authenticated session",
        },
      });
    }

    // Initialize user operations
    const userOps = new UserOperations(prismaClient);

    // Add user address
    const result = await userOps.addUserAddress({
      userId: user.user_id,
      addressType: addressType as "DEFAULT" | "SHIPPING" | "BILLING",
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      company: company?.trim(),
      address1: address1.trim(),
      address2: address2?.trim(),
      address3: address3?.trim(),
      city: city.trim(),
      province: province.trim(),
      provinceCode: provinceCode?.trim()?.toUpperCase() || "",
      country: country.trim(),
      countryCode: countryCode?.trim()?.toUpperCase() || "",
      zip: zip.trim(),
      phone: phone?.trim(),
    });

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: result.error,
      });
    }

    // Return success response
    return JSON.stringify({
      success: true,
      data: {
        address: result.data!.address,
      },
      message: "Address added successfully",
    });
  } catch (err) {
    console.error("Error occurred while adding user address");
    console.error(err);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "An internal error occurred while adding the address";

    if (err instanceof Error) {
      if (err.message.includes("Foreign key constraint")) {
        errorCode = "INVALID_REFERENCE";
        errorMessage = "Invalid reference to user data";
      } else if (err.message.includes("Unique constraint")) {
        errorCode = "DUPLICATE_ADDRESS";
        errorMessage = "Similar address already exists for this user";
      }
    }

    return JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: {
          error: err instanceof Error ? err.message : String(err),
        },
      },
    });
  }
};
