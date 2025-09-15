import {
  address_type,
  addresses,
  buyer_profiles,
  buyer_verification_status_type,
  PrismaClient,
  resale_certificates,
  seller_profiles,
  user_addresses,
  user_type,
  users,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface CreateUserData {
  username: string;
  cognito_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: user_type;
  company?: string;
  title?: string;
  job_title?: string;
  date_of_birth?: Date;
}

export interface CreateBuyerProfileData {
  user_id: string;
  reseller_tax_id?: string;
  verification_status: buyer_verification_status_type;
}

export interface CreateSellerProfileData {
  user_id: string;
}

export interface CreateAddressData {
  first_name?: string;
  last_name?: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  province: string;
  province_code?: string;
  country: string;
  country_code?: string;
  zip: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateUserAddressData {
  user_id: string;
  address_id: string;
  address_type: address_type;
}

export class UserDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get user by email
   */
  async getUserByEmail(
    email: string,
    tx: PrismaClient = this.prisma
  ): Promise<users | null> {
    return await tx.users.findUnique({
      where: { email },
    });
  }

  /**
   * Get user by Cognito ID
   */
  async getUserByCognitoId(
    cognitoId: string,
    tx: PrismaClient = this.prisma
  ): Promise<users | null> {
    return await tx.users.findUnique({
      where: { cognito_id: cognitoId },
    });
  }

  async getUserWithBuyerProfileByCognitoId(
    cognitoId: string,
    tx: PrismaClient = this.prisma
  ): Promise<(users & { buyer_profiles: buyer_profiles | null }) | null> {
    return await tx.users.findUnique({
      relationLoadStrategy: "join",
      where: { cognito_id: cognitoId },
      include: {
        buyer_profiles: true,
      },
    });
  }

  /**
   * Get user by username
   */
  async getUserByUsername(
    username: string,
    tx: PrismaClient = this.prisma
  ): Promise<users | null> {
    return await tx.users.findUnique({
      where: { username },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<users | null> {
    return await tx.users.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Create a new user
   */
  async createUser(
    userData: CreateUserData,
    tx: PrismaClient = this.prisma
  ): Promise<users> {
    return await tx.users.create({
      data: {
        username: userData.username,
        cognito_id: userData.cognito_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        user_type: userData.user_type,
        company: userData.company,
        title: userData.title,
        job_title: userData.job_title,
        date_of_birth: userData.date_of_birth,
        account_locked: false,
        risk_score: 0.0,
        created_at: new Date(),
      },
    });
  }

  /**
   * Get buyer profile by user ID
   */
  async getBuyerProfileByUserId(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profiles | null> {
    return await tx.buyer_profiles.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Create buyer profile
   */
  async createBuyerProfile(
    profileData: CreateBuyerProfileData,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profiles> {
    return await tx.buyer_profiles.create({
      data: {
        user_id: profileData.user_id,
        reseller_tax_id: profileData.reseller_tax_id,
        verification_status: profileData.verification_status,
        created_at: new Date(),
      },
    });
  }

  /**
   * Get seller profile by user ID
   */
  async getSellerProfileByUserId(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<seller_profiles | null> {
    return await tx.seller_profiles.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Create seller profile
   */
  async createSellerProfile(
    profileData: CreateSellerProfileData,
    tx: PrismaClient = this.prisma
  ): Promise<seller_profiles> {
    return await tx.seller_profiles.create({
      data: {
        user_id: profileData.user_id,
        created_at: new Date(),
      },
    });
  }

  /**
   * Get resale certificate by ID
   */
  async getResaleCertificateById(
    certificateId: string,
    tx: PrismaClient = this.prisma
  ): Promise<resale_certificates | null> {
    return await tx.resale_certificates.findUnique({
      where: { resale_certificate_id: certificateId },
    });
  }

  /**
   * Create address
   */
  async createAddress(
    addressData: CreateAddressData,
    tx: PrismaClient = this.prisma
  ): Promise<addresses> {
    return await tx.addresses.create({
      data: {
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        company: addressData.company,
        address1: addressData.address1,
        address2: addressData.address2,
        address3: addressData.address3,
        city: addressData.city,
        province: addressData.province,
        province_code: addressData.province_code,
        country: addressData.country,
        country_code: addressData.country_code,
        zip: addressData.zip,
        phone: addressData.phone,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        created_at: new Date(),
      },
    });
  }

  /**
   * Create user address relationship
   */
  async createUserAddress(
    userAddressData: CreateUserAddressData,
    tx: PrismaClient = this.prisma
  ): Promise<user_addresses> {
    return await tx.user_addresses.create({
      data: {
        user_id: userAddressData.user_id,
        address_id: userAddressData.address_id,
        address_type: userAddressData.address_type,
        created_at: new Date(),
      },
    });
  }

  /**
   * Get user addresses
   */
  async getUserAddresses(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      address_id: string;
      public_id: string;
      address_type: string | null;
      first_name: string | null;
      last_name: string | null;
      company: string | null;
      address1: string;
      address2: string | null;
      address3: string | null;
      city: string;
      province: string;
      province_code: string | null;
      country: string;
      country_code: string | null;
      zip: string;
      phone: string | null;
      latitude: any;
      longitude: any;
      created_at: Date | null;
    }>
  > {
    const userAddresses = await tx.user_addresses.findMany({
      where: { user_id: userId },
      include: {
        addresses: true,
      },
      orderBy: { created_at: "desc" },
    });

    return userAddresses.map((ua) => ({
      address_id: ua.addresses.address_id,
      public_id: ua.addresses.public_id,
      address_type: ua.address_type,
      first_name: ua.addresses.first_name,
      last_name: ua.addresses.last_name,
      company: ua.addresses.company,
      address1: ua.addresses.address1,
      address2: ua.addresses.address2,
      address3: ua.addresses.address3,
      city: ua.addresses.city,
      province: ua.addresses.province,
      province_code: ua.addresses.province_code,
      country: ua.addresses.country,
      country_code: ua.addresses.country_code,
      zip: ua.addresses.zip,
      phone: ua.addresses.phone,
      latitude: ua.addresses.latitude,
      longitude: ua.addresses.longitude,
      created_at: ua.addresses.created_at,
    }));
  }

  /**
   * Get user with profiles
   */
  async getUserWithProfiles(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    user: users;
    buyer_profile?: buyer_profiles;
    seller_profile?: seller_profiles;
  } | null> {
    const user = await tx.users.findUnique({
      where: { user_id: userId },
      include: {
        buyer_profiles: true,
        seller_profiles: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      user,
      buyer_profile: user.buyer_profiles || undefined,
      seller_profile: user.seller_profiles || undefined,
    };
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateData: Partial<{
      first_name: string;
      last_name: string;
      phone: string;
      company: string;
      title: string;
      job_title: string;
      avatar_url: string;
    }>,
    tx: PrismaClient = this.prisma
  ): Promise<users> {
    return await tx.users.update({
      where: { user_id: userId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Update buyer profile
   */
  async updateBuyerProfile(
    buyerProfileId: string,
    updateData: Partial<{
      reseller_tax_id: string;
      verification_status: buyer_verification_status_type;
    }>,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profiles> {
    return await tx.buyer_profiles.update({
      where: { buyer_profile_id: buyerProfileId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Update seller profile
   */
  async updateSellerProfile(
    sellerProfileId: string,
    updateData: Partial<{
      last_active: Date;
    }>,
    tx: PrismaClient = this.prisma
  ): Promise<seller_profiles> {
    return await tx.seller_profiles.update({
      where: { seller_profile_id: sellerProfileId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Delete user address
   */
  async deleteUserAddress(
    userId: string,
    addressId: string,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    await tx.user_addresses.deleteMany({
      where: {
        user_id: userId,
        address_id: addressId,
      },
    });
  }

  /**
   * Update address
   */
  async updateAddress(
    addressId: string,
    updateData: Partial<CreateAddressData>,
    tx: PrismaClient = this.prisma
  ): Promise<addresses> {
    return await tx.addresses.update({
      where: { address_id: addressId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Check if user has address
   */
  async userHasAddress(
    userId: string,
    addressId: string,
    tx: PrismaClient = this.prisma
  ): Promise<boolean> {
    const count = await tx.user_addresses.count({
      where: {
        user_id: userId,
        address_id: addressId,
      },
    });
    return count > 0;
  }

  /**
   * Get address by public ID
   */
  async getAddressByPublicId(
    publicId: string,
    tx: PrismaClient = this.prisma
  ): Promise<addresses | null> {
    return await tx.addresses.findUnique({
      where: { public_id: publicId },
    });
  }

  /**
   * Get user by public ID
   */
  async getUserByPublicId(
    publicId: string,
    tx: PrismaClient = this.prisma
  ): Promise<users | null> {
    return await tx.users.findUnique({
      where: { public_id: publicId },
    });
  }

  /**
   * Lock/unlock user account
   */
  async updateAccountLockStatus(
    userId: string,
    locked: boolean,
    tx: PrismaClient = this.prisma
  ): Promise<users> {
    return await tx.users.update({
      where: { user_id: userId },
      data: {
        account_locked: locked,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Update user risk score
   */
  async updateUserRiskScore(
    userId: string,
    riskScore: number,
    tx: PrismaClient = this.prisma
  ): Promise<users> {
    return await tx.users.update({
      where: { user_id: userId },
      data: {
        risk_score: riskScore,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Search users (admin function)
   */
  async searchUsers(
    searchParams: {
      query?: string;
      userType?: user_type;
      verificationStatus?: buyer_verification_status_type;
      accountLocked?: boolean;
      createdAfter?: Date;
      createdBefore?: Date;
      page?: number;
      limit?: number;
    },
    tx: PrismaClient = this.prisma
  ): Promise<{
    users: Array<{
      user_id: string;
      public_id: string;
      username: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      user_type: string;
      account_locked: boolean | null;
      risk_score: any;
      created_at: Date | null;
    }>;
    total: number;
  }> {
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Text search across multiple fields
    if (searchParams.query) {
      where.OR = [
        { username: { contains: searchParams.query, mode: "insensitive" } },
        { email: { contains: searchParams.query, mode: "insensitive" } },
        { first_name: { contains: searchParams.query, mode: "insensitive" } },
        { last_name: { contains: searchParams.query, mode: "insensitive" } },
        { company: { contains: searchParams.query, mode: "insensitive" } },
      ];
    }

    // Filter by user type
    if (searchParams.userType) {
      where.user_type = searchParams.userType;
    }

    // Filter by account locked status
    if (searchParams.accountLocked !== undefined) {
      where.account_locked = searchParams.accountLocked;
    }

    // Filter by creation date range
    if (searchParams.createdAfter || searchParams.createdBefore) {
      where.created_at = {};
      if (searchParams.createdAfter) {
        where.created_at.gte = searchParams.createdAfter;
      }
      if (searchParams.createdBefore) {
        where.created_at.lte = searchParams.createdBefore;
      }
    }

    // Filter by buyer verification status (if provided)
    if (searchParams.verificationStatus) {
      where.buyer_profiles = {
        verification_status: searchParams.verificationStatus,
      };
    }

    const [users, total] = await Promise.all([
      tx.users.findMany({
        where,
        select: {
          user_id: true,
          public_id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          user_type: true,
          account_locked: true,
          risk_score: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      tx.users.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        user_id: user.user_id,
        public_id: user.public_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        account_locked: user.account_locked,
        risk_score: user.risk_score,
        created_at: user.created_at,
      })),
      total,
    };
  }

  /**
   * Get user profile summary
   */
  async getUserProfileSummary(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    user: users;
    buyer_profile?: buyer_profiles;
    seller_profile?: seller_profiles;
    address_count: number;
  } | null> {
    const user = await tx.users.findUnique({
      where: { user_id: userId },
      include: {
        buyer_profiles: true,
        seller_profiles: true,
        user_addresses: {
          select: { address_id: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      user,
      buyer_profile: user.buyer_profiles || undefined,
      seller_profile: user.seller_profiles || undefined,
      address_count: user.user_addresses.length,
    };
  }
}
