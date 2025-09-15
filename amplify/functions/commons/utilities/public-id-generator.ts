import { customAlphabet } from "nanoid";

/**
 * Standardized ID length for all entities (14 characters)
 * Provides extra safety margin with virtually zero collision probability
 */
export const STANDARD_ID_LENGTH = 14; // If you change this or any other logic here, make sure to update generate_simple_public_id() postgresql function too

/**
 * Configuration for public ID generation
 */
export const PUBLIC_ID_CONFIG = {
  // Custom alphabet excluding confusing characters (0, O, 1, l, I)
  SAFE_ALPHABET: "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  // Maximum retry attempts for collision handling
  MAX_RETRY_ATTEMPTS: 5,
} as const;

/**
 * Create a nanoid generator with safe alphabet
 */
const generateSafeId = customAlphabet(
  PUBLIC_ID_CONFIG.SAFE_ALPHABET,
  STANDARD_ID_LENGTH
);

/**
 * Generate a public ID (12 characters, safe alphabet)
 */
export function generatePublicId(): string {
  return generateSafeId();
}

/**
 * Generate a custom public ID with specified parameters
 */
export function generateCustomPublicId(
  length: number = STANDARD_ID_LENGTH,
  alphabet: string = PUBLIC_ID_CONFIG.SAFE_ALPHABET
): string {
  const customGenerator = customAlphabet(alphabet, length);
  return customGenerator();
}

/**
 * Validate public ID format
 */
export function validatePublicId(publicId: string): boolean {
  // Check length and character set
  if (publicId.length !== STANDARD_ID_LENGTH) {
    return false;
  }

  // Check if all characters are from safe alphabet
  const pattern = new RegExp(
    `^[${PUBLIC_ID_CONFIG.SAFE_ALPHABET}]{${STANDARD_ID_LENGTH}}$`
  );
  return pattern.test(publicId);
}

/**
 * Type for database check function
 */
export type PublicIdExistsChecker = (publicId: string) => Promise<boolean>;

/**
 * Generate a unique public ID with collision checking
 */
export async function generateUniquePublicId(
  checkExists: PublicIdExistsChecker
): Promise<string> {
  let attempts = 0;

  while (attempts < PUBLIC_ID_CONFIG.MAX_RETRY_ATTEMPTS) {
    const publicId = generatePublicId();

    try {
      const exists = await checkExists(publicId);
      if (!exists) {
        return publicId;
      }
    } catch (error) {
      console.error("Error checking public ID existence:", error);
      throw new Error("Failed to verify public ID uniqueness");
    }

    attempts++;
  }

  throw new Error(
    `Failed to generate unique public ID after ${PUBLIC_ID_CONFIG.MAX_RETRY_ATTEMPTS} attempts`
  );
}

/**
 * Batch generate multiple unique public IDs
 */
export async function generateBatchPublicIds(
  count: number,
  checkExists: PublicIdExistsChecker
): Promise<string[]> {
  const ids: string[] = [];
  const idSet = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;

    while (attempts < PUBLIC_ID_CONFIG.MAX_RETRY_ATTEMPTS) {
      const publicId = generatePublicId();

      // Check against our local set first (faster)
      if (idSet.has(publicId)) {
        attempts++;
        continue;
      }

      // Check against database
      try {
        const exists = await checkExists(publicId);
        if (!exists) {
          ids.push(publicId);
          idSet.add(publicId);
          break;
        }
      } catch (error) {
        console.error("Error checking public ID existence:", error);
        throw new Error("Failed to verify public ID uniqueness");
      }

      attempts++;
    }

    if (attempts >= PUBLIC_ID_CONFIG.MAX_RETRY_ATTEMPTS) {
      throw new Error(
        `Failed to generate unique public ID for batch item ${i + 1}`
      );
    }
  }

  return ids;
}

/**
 * Utility class for managing public IDs
 */
export class PublicIdManager {
  constructor(private checkExists: PublicIdExistsChecker) {}

  /**
   * Generate a single unique public ID
   */
  async generate(): Promise<string> {
    return generateUniquePublicId(this.checkExists);
  }

  /**
   * Generate multiple unique public IDs
   */
  async generateBatch(count: number): Promise<string[]> {
    return generateBatchPublicIds(count, this.checkExists);
  }

  /**
   * Validate a public ID format
   */
  validate(publicId: string): boolean {
    return validatePublicId(publicId);
  }

  /**
   * Get the standard length
   */
  getLength(): number {
    return STANDARD_ID_LENGTH;
  }
}

/**
 * Factory function to create PublicIdManager instances
 */
export function createPublicIdManager(
  checkExists: PublicIdExistsChecker
): PublicIdManager {
  return new PublicIdManager(checkExists);
}

/**
 * Database checker functions for different database libraries
 */

// Generic SQL checker
export function createSqlPublicIdChecker(
  tableName: string,
  columnName: string = "public_id",
  queryFn: (sql: string, params: any[]) => Promise<any>
) {
  return async (publicId: string): Promise<boolean> => {
    const result = await queryFn(
      `SELECT 1 FROM ${tableName} WHERE ${columnName} = $1 LIMIT 1`,
      [publicId]
    );
    return Array.isArray(result.rows)
      ? result.rows.length > 0
      : result.length > 0;
  };
}

// PostgreSQL with pg library
export function createPgPublicIdChecker(
  pgClient: any,
  tableName: string,
  columnName: string = "public_id"
) {
  return createSqlPublicIdChecker(tableName, columnName, (sql, params) =>
    pgClient.query(sql, params)
  );
}

// Prisma checker
export function createPrismaPublicIdChecker(
  prismaModel: any,
  columnName: string = "public_id"
) {
  return async (publicId: string): Promise<boolean> => {
    const result = await prismaModel.findUnique({
      where: { [columnName]: publicId },
      select: { [columnName]: true },
    });
    return result !== null;
  };
}

// TypeORM checker
export function createTypeOrmPublicIdChecker(
  repository: any,
  columnName: string = "public_id"
) {
  return async (publicId: string): Promise<boolean> => {
    const count = await repository.count({
      where: { [columnName]: publicId },
    });
    return count > 0;
  };
}

// Knex.js checker
export function createKnexPublicIdChecker(
  knex: any,
  tableName: string,
  columnName: string = "public_id"
) {
  return async (publicId: string): Promise<boolean> => {
    const result = await knex(tableName).where(columnName, publicId).first();
    return result !== undefined;
  };
}

/**
 * Convenience object for public ID operations
 */
export const PublicId = {
  /**
   * Generate a new public ID
   */
  generate: () => generatePublicId(),

  /**
   * Generate a unique public ID with collision checking
   */
  generateUnique: (checkExists: PublicIdExistsChecker) =>
    generateUniquePublicId(checkExists),

  /**
   * Validate a public ID format
   */
  validate: (id: string) => validatePublicId(id),

  /**
   * Generate a custom public ID
   */
  generateCustom: (length?: number, alphabet?: string) =>
    generateCustomPublicId(length, alphabet),

  /**
   * Create a manager instance
   */
  createManager: (checkExists: PublicIdExistsChecker) =>
    createPublicIdManager(checkExists),

  /**
   * Generate multiple IDs
   */
  generateBatch: (count: number, checkExists: PublicIdExistsChecker) =>
    generateBatchPublicIds(count, checkExists),
};
