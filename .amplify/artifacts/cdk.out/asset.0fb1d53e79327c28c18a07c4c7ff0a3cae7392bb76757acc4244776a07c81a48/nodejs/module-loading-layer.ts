import { PrismaClient } from "./prisma/generated/client/index";

export function prismaClient(prismaDataSourceUrl: string) {
  try {
    const prismaClient = new PrismaClient({
      datasourceUrl: prismaDataSourceUrl,
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "event",
          level: "error",
        },
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "warn",
        },
      ],
    });

    prismaClient.$on("query", (e) => {
      console.debug("Query: " + e.query);
      console.debug("Params: " + e.params);
      console.debug("Duration: " + e.duration + "ms");
    });

    prismaClient.$on("error", (e) => {
      console.error("Prisma Error Message: " + e.message);
    });

    return prismaClient;
  } catch (err) {
    console.error("Error occurred while creating prisma client");
    console.error(err);
    return null;
  }
}
