import { env } from "$amplify/env/query-data";
import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

const RESTRICTED_TABLES = new Set(["access_details"]);

export const handler: Schema["queryData"]["functionHandler"] = async (
  event,
  context
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  try {
    const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
      env.DB_CONNECTION_DETAILS
    );
    const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

    const prismaClient = (await importModuleFromLayer())?.prismaClient(
      prismaDataSourceUrl
    )!;

    const { modelName, operation, query } = event.arguments;

    if (!modelName || !operation || !query) {
      throw new Error("modelName, operation, and query are required");
    }

    // Block sensitive data requests
    // Prism's omit api seems to be not working, so adding a crude way to block requests
    const attributeKeys = new Set(
      getAllKeys(JSON.parse(query)).flatMap((key) => key.split("."))
    );

    if (
      operation.toLowerCase().includes("find") &&
      Array.from(attributeKeys).filter((key) => RESTRICTED_TABLES.has(key))
        .length > 0
    ) {
      console.error("Request blocked to restricted table");
      throw new Error("Request blocked to restricted table");
    }

    let queryResult = {};

    try {
      // TODO: find proper types
      // @ts-ignore
      const queryFunction = prismaClient[modelName][operation];
      queryResult = await queryFunction({ ...JSON.parse(query) });
    } catch (error) {
      console.error("Error occurred while running query. ", query, error);
      throw error;
    } finally {
      await prismaClient.$disconnect();
    }

    return JSON.stringify(queryResult);
  } catch (err) {
    console.error("Error occurred while handling event");
    console.error(err);
    throw err;
  }
};

function getAllKeys(obj: any, prefix: string = ""): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + "."));
    } else {
      keys.push(prefix + key);
    }
  }

  return keys;
}
