import {
  address_type,
  buyer_verification_status_type,
  PrismaClient,
  user_type,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { UserDatabaseOperations } from "./UserDatabaseOperations";

export interface CreateUserConfig {
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: "BUYER" | "SELLER" | "BUYER_AND_SELLER";
  company?: string;
  title?: string;
  jobTitle?: string;
  dateOfBirth?: Date;
  cognitoId: string;
}

export interface CreateBuyerProfileConfig {
  userId: string;
  resellerTaxId?: string;
}

export interface CreateSellerProfileConfig {
  userId: string;
}

export interface AddUserAddressConfig {
  userId: string;
  addressType: "DEFAULT" | "SHIPPING" | "BILLING";
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

export interface CreateUserResult {
  success: boolean;
  data?: {
    user: {
      user_id: string;
      public_id: string;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      user_type: string;
      company?: string;
      title?: string;
      job_title?: string;
      date_of_birth?: Date;
      avatar_url?: string;
      account_locked: boolean;
      risk_score: number;
      created_at: Date;
      updated_at?: Date;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateBuyerProfileResult {
  success: boolean;
  data?: {
    buyer_profile: {
      buyer_profile_id: string;
      public_id: string;
      user_id: string;
      verification_status: string;
      reseller_tax_id?: string;
      created_at: Date;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateSellerProfileResult {
  success: boolean;
  data?: {
    seller_profile: {
      seller_profile_id: string;
      public_id: string;
      user_id: string;
      last_active?: Date;
      created_at: Date;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AddUserAddressResult {
  success: boolean;
  data?: {
    address: {
      address_id: string;
      public_id: string;
      address_type: string;
      first_name: string;
      last_name: string;
      company?: string;
      address1: string;
      address2?: string;
      address3?: string;
      city: string;
      province: string;
      province_code: string;
      country: string;
      country_code: string;
      zip: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
      created_at: Date;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class UserOperations {
  private dbOps: UserDatabaseOperations;

  constructor(private prisma: PrismaClient) {
    this.dbOps = new UserDatabaseOperations(prisma);
  }

  async createUser(config: CreateUserConfig): Promise<CreateUserResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if user already exists by email
        const existingUser = await this.dbOps.getUserByEmail(
          config.email,
          tx as PrismaClient
        );
        if (existingUser) {
          return {
            success: false,
            error: {
              code: "USER_EXISTS",
              message: "User with this email already exists",
              details: { email: config.email },
            },
          };
        }

        // Check if user already exists by cognitoId
        const existingCognitoUser = await this.dbOps.getUserByCognitoId(
          config.cognitoId,
          tx as PrismaClient
        );
        if (existingCognitoUser) {
          return {
            success: false,
            error: {
              code: "USER_EXISTS",
              message: "User with this Cognito ID already exists",
              details: { cognitoId: config.cognitoId },
            },
          };
        }

        // Check if username already exists (if provided)
        if (config.username) {
          const existingUsername = await this.dbOps.getUserByUsername(
            config.username,
            tx as PrismaClient
          );
          if (existingUsername) {
            return {
              success: false,
              error: {
                code: "USERNAME_EXISTS",
                message: "Username already exists",
                details: { username: config.username },
              },
            };
          }
        }

        // Generate username if not provided
        const username =
          config.username ||
          (await this.generateUsername(config.email, tx as PrismaClient));

        // Create the user
        const user = await this.dbOps.createUser(
          {
            username,
            cognito_id: config.cognitoId,
            email: config.email,
            first_name: config.firstName,
            last_name: config.lastName,
            phone: config.phone,
            user_type: config.userType as user_type,
            company: config.company,
            title: config.title,
            job_title: config.jobTitle,
            date_of_birth: config.dateOfBirth,
          },
          tx as PrismaClient
        );

        return {
          success: true,
          data: {
            user: {
              user_id: user.user_id,
              public_id: user.public_id,
              username: user.username,
              email: user.email,
              first_name: user.first_name!,
              last_name: user.last_name!,
              phone: user.phone || undefined,
              user_type: user.user_type,
              company: user.company || undefined,
              title: user.title || undefined,
              job_title: user.job_title || undefined,
              date_of_birth: user.date_of_birth || undefined,
              avatar_url: user.avatar_url || undefined,
              account_locked: user.account_locked || false,
              risk_score: Number(user.risk_score || 0),
              created_at: user.created_at!,
              updated_at: user.updated_at || undefined,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error in createUser:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred while creating the user",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  async createBuyerProfile(
    config: CreateBuyerProfileConfig
  ): Promise<CreateBuyerProfileResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if user exists
        const user = await this.dbOps.getUserById(
          config.userId,
          tx as PrismaClient
        );
        if (!user) {
          return {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
              details: { userId: config.userId },
            },
          };
        }

        // Check if user type allows buyer profile
        if (
          user.user_type !== "BUYER" &&
          user.user_type !== "BUYER_AND_SELLER"
        ) {
          return {
            success: false,
            error: {
              code: "INVALID_USER_TYPE",
              message: "User type does not allow buyer profile creation",
              details: {
                userType: user.user_type,
                allowedTypes: ["BUYER", "BUYER_AND_SELLER"],
              },
            },
          };
        }

        // Check if buyer profile already exists
        const existingProfile = await this.dbOps.getBuyerProfileByUserId(
          config.userId,
          tx as PrismaClient
        );
        if (existingProfile) {
          return {
            success: false,
            error: {
              code: "PROFILE_EXISTS",
              message: "Buyer profile already exists for this user",
              details: {
                existingProfileId: existingProfile.public_id,
                userId: config.userId,
              },
            },
          };
        }

        // Validate reseller tax ID if provided
        if (config.resellerTaxId) {
          const existingCertificate = await this.dbOps.getResaleCertificateById(
            config.resellerTaxId,
            tx as PrismaClient
          );
          if (!existingCertificate) {
            return {
              success: false,
              error: {
                code: "INVALID_RESELLER_TAX_ID",
                message: "Invalid reseller tax ID",
                details: { resellerTaxId: config.resellerTaxId },
              },
            };
          }
        }

        // Create buyer profile
        const buyerProfile = await this.dbOps.createBuyerProfile(
          {
            user_id: config.userId,
            reseller_tax_id: config.resellerTaxId,
            verification_status: "PENDING" as buyer_verification_status_type,
          },
          tx as PrismaClient
        );

        return {
          success: true,
          data: {
            buyer_profile: {
              buyer_profile_id: buyerProfile.buyer_profile_id,
              public_id: buyerProfile.public_id,
              user_id: buyerProfile.user_id,
              verification_status: buyerProfile.verification_status,
              reseller_tax_id: buyerProfile.reseller_tax_id || undefined,
              created_at: buyerProfile.created_at!,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error in createBuyerProfile:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while creating the buyer profile",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  async createSellerProfile(
    config: CreateSellerProfileConfig
  ): Promise<CreateSellerProfileResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if user exists
        const user = await this.dbOps.getUserById(
          config.userId,
          tx as PrismaClient
        );
        if (!user) {
          return {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
              details: { userId: config.userId },
            },
          };
        }

        // Check if user type allows seller profile
        if (
          user.user_type !== "SELLER" &&
          user.user_type !== "BUYER_AND_SELLER"
        ) {
          return {
            success: false,
            error: {
              code: "INVALID_USER_TYPE",
              message: "User type does not allow seller profile creation",
              details: {
                userType: user.user_type,
                allowedTypes: ["SELLER", "BUYER_AND_SELLER"],
              },
            },
          };
        }

        // Check if seller profile already exists
        const existingProfile = await this.dbOps.getSellerProfileByUserId(
          config.userId,
          tx as PrismaClient
        );
        if (existingProfile) {
          return {
            success: false,
            error: {
              code: "PROFILE_EXISTS",
              message: "Seller profile already exists for this user",
              details: {
                existingProfileId: existingProfile.public_id,
                userId: config.userId,
              },
            },
          };
        }

        // Create seller profile
        const sellerProfile = await this.dbOps.createSellerProfile(
          {
            user_id: config.userId,
          },
          tx as PrismaClient
        );

        return {
          success: true,
          data: {
            seller_profile: {
              seller_profile_id: sellerProfile.seller_profile_id,
              public_id: sellerProfile.public_id,
              user_id: sellerProfile.user_id,
              last_active: sellerProfile.last_active || undefined,
              created_at: sellerProfile.created_at!,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error in createSellerProfile:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while creating the seller profile",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  async addUserAddress(
    config: AddUserAddressConfig
  ): Promise<AddUserAddressResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if user exists
        const user = await this.dbOps.getUserById(
          config.userId,
          tx as PrismaClient
        );
        if (!user) {
          return {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
              details: { userId: config.userId },
            },
          };
        }

        // Create address
        const address = await this.dbOps.createAddress(
          {
            first_name: config.firstName,
            last_name: config.lastName,
            company: config.company,
            address1: config.address1,
            address2: config.address2,
            address3: config.address3,
            city: config.city,
            province: config.province,
            province_code: config.provinceCode,
            country: config.country,
            country_code: config.countryCode,
            zip: config.zip,
            phone: config.phone,
          },
          tx as PrismaClient
        );

        // Link address to user
        await this.dbOps.createUserAddress(
          {
            user_id: config.userId,
            address_id: address.address_id,
            address_type: config.addressType as address_type,
          },
          tx as PrismaClient
        );

        return {
          success: true,
          data: {
            address: {
              address_id: address.address_id,
              public_id: address.public_id,
              address_type: config.addressType,
              first_name: address.first_name || config.firstName,
              last_name: address.last_name || config.lastName,
              company: address.company || undefined,
              address1: address.address1,
              address2: address.address2 || undefined,
              address3: address.address3 || undefined,
              city: address.city,
              province: address.province,
              province_code: address.province_code || config.provinceCode,
              country: address.country,
              country_code: address.country_code || config.countryCode,
              zip: address.zip,
              phone: address.phone || undefined,
              latitude: address.latitude ? Number(address.latitude) : undefined,
              longitude: address.longitude
                ? Number(address.longitude)
                : undefined,
              created_at: address.created_at!,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error in addUserAddress:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred while adding the address",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  private async generateUsername(
    email: string,
    tx: PrismaClient
  ): Promise<string> {
    const baseUsername = email.split("@")[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;

    while (await this.dbOps.getUserByUsername(username, tx)) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    return username;
  }
}
