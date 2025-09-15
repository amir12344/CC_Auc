import { env } from "$amplify/env/create-user";
import { AppSyncIdentityCognito } from "aws-lambda";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { UserOperations } from "../commons/operations/users/UserOperations";
import { notificationService } from "../commons/utilities/UnifiedNotificationService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

export const handler: Schema["createUser"]["functionHandler"] = async (
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
    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      userType,
      company,
      title,
      jobTitle,
      dateOfBirth,
    } = event.arguments;

    // Validate required arguments
    if (!email || email.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email is required",
          details: [
            {
              field: "email",
              message: "Email is required and cannot be empty",
            },
          ],
        },
      });
    }

    if (!firstName || firstName.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "First name is required",
          details: [
            {
              field: "firstName",
              message: "First name is required and cannot be empty",
            },
          ],
        },
      });
    }

    if (!lastName || lastName.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Last name is required",
          details: [
            {
              field: "lastName",
              message: "Last name is required and cannot be empty",
            },
          ],
        },
      });
    }

    if (
      !userType ||
      !["BUYER", "SELLER", "BUYER_AND_SELLER"].includes(userType)
    ) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Valid user type is required",
          details: [
            {
              field: "userType",
              message:
                "User type must be one of: BUYER, SELLER, BUYER_AND_SELLER",
            },
          ],
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email format",
          details: [
            {
              field: "email",
              message: "Email format is invalid",
            },
          ],
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

    // Validate date of birth if provided
    let parsedDateOfBirth: Date | undefined;
    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);
      if (isNaN(parsedDateOfBirth.getTime())) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid date of birth",
            details: [
              {
                field: "dateOfBirth",
                message: "Date of birth must be a valid date",
              },
            ],
          },
        });
      }

      // Check if date of birth is in the future
      if (parsedDateOfBirth > new Date()) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Date of birth cannot be in the future",
            details: [
              {
                field: "dateOfBirth",
                message: "Date of birth cannot be in the future",
              },
            ],
          },
        });
      }

      // Check if user is at least 13 years old (basic age validation)
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (parsedDateOfBirth > minAge) {
        return JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User must be at least 13 years old",
            details: [
              {
                field: "dateOfBirth",
                message: "User must be at least 13 years old",
              },
            ],
          },
        });
      }
    }

    if (!cognitoId || cognitoId.trim() === "") {
      return JSON.stringify({
        success: false,
        error: {
          code: "COGNITO_ID_REQUIRED",
          message: "Cognito ID is required for user creation",
        },
      });
    }

    // Initialize user operations
    const userOps = new UserOperations(prismaClient);

    // Create user
    const result = await userOps.createUser({
      username: username?.trim(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      userType: userType as "BUYER" | "SELLER" | "BUYER_AND_SELLER",
      company: company?.trim(),
      title: title?.trim(),
      jobTitle: jobTitle?.trim(),
      dateOfBirth: parsedDateOfBirth,
      cognitoId,
    });

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: result.error,
      });
    }

    // Send welcome notifications (email and web)
    try {
      await notificationService.sendUserWelcomeNotification({
        userId: result.data!.user.user_id,
        userEmail: result.data!.user.email,
        userName: `${result.data!.user.first_name} ${result.data!.user.last_name}`,
        userType: result.data!.user.user_type as
          | "BUYER"
          | "SELLER"
          | "BUYER_AND_SELLER",
      });
      console.log(
        `Welcome notifications sent for user: ${result.data!.user.user_id}`
      );
    } catch (notificationError) {
      console.error("Failed to send welcome notifications:", notificationError);
      // Don't fail user creation if notifications fail - just log the error
    }

    // Return success response
    return JSON.stringify({
      success: true,
      data: {
        user: result.data!.user,
      },
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Error occurred while creating user");
    console.error(err);

    // Handle specific database errors
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "An internal error occurred while creating the user";

    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        if (err.message.includes("email")) {
          errorCode = "EMAIL_EXISTS";
          errorMessage = "User with this email already exists";
        } else if (err.message.includes("username")) {
          errorCode = "USERNAME_EXISTS";
          errorMessage = "Username already exists";
        } else if (err.message.includes("cognito_id")) {
          errorCode = "USER_EXISTS";
          errorMessage = "User with this Cognito ID already exists";
        }
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
