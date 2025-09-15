import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { cookies } from "next/headers";
import { outputs } from "../../amplify-config";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

// Helper function for App Router context
export async function runWithAmplifyServerContextAppRouter<T>(
  operation: (contextSpec: any) => Promise<T>
): Promise<T> {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation,
  });
}
