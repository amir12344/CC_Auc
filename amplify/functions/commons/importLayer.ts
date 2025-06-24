import * as fs from "fs/promises";
import * as path from "path";
import { PrismaClient } from "../lambda-layers/core-layer/nodejs/prisma/generated/client";

// Define a generic type or use any if the type is not known beforehand
async function dynamicImportIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const fullPath = path.resolve(filePath);
    await fs.access(fullPath);
    const module = (await import(fullPath)) as T;
    console.log("Module loaded successfully");
    return module;
  } catch (error) {
    console.error("Error loading module:", error);
    return null;
  }
}

let module: PackageLoaderLayer | null = null;

// Define the interface for the myScript from the lambda layer
// amplify/functions/layer/nodejs/myScript.ts file
export interface PackageLoaderLayer {
  prismaClient(prismaDataSourceUrl: string): PrismaClient | null;
}

export const importModuleFromLayer = async () => {
  if (module) {
    return module;
  }

  // this code is inside the lambda layer
  module = await dynamicImportIfExists<PackageLoaderLayer>(
    "/opt/nodejs/module-loading-layer.js"
  );

  return module;
};
