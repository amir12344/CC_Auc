import { useEffect, useState } from "react";

import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import type { Schema } from "@/amplify/data/resource";

let cachedPublicId: string | null | undefined;
let inflight: Promise<string | null> | null = null;

async function fetchPublicId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    const client = generateClient<Schema>({ authMode: "apiKey" });
    const query = {
      relationLoadStrategy: "join",
      where: { cognito_id: user.userId },
      select: { public_id: true },
      take: 1,
    };
    const { data } = await client.queries.queryData({
      modelName: "users",
      operation: "findFirst",
      query: JSON.stringify(query),
    } as any);
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed?.public_id ?? null;
  } catch (_e) {
    return null;
  }
}

export async function getUserPublicIdCached(): Promise<string | null> {
  if (cachedPublicId !== undefined) {
    return cachedPublicId as string | null;
  }
  if (inflight) return inflight;
  inflight = fetchPublicId()
    .then((pid) => {
      cachedPublicId = pid;
      inflight = null;
      return pid;
    })
    .catch((_e) => {
      cachedPublicId = null;
      inflight = null;
      return null;
    });
  return inflight;
}

export function useUserPublicId(): {
  publicId: string | null;
  loading: boolean;
} {
  const [publicId, setPublicId] = useState<string | null>(
    cachedPublicId ?? null
  );
  const [loading, setLoading] = useState<boolean>(cachedPublicId === undefined);

  useEffect(() => {
    let mounted = true;
    if (cachedPublicId === undefined) {
      setLoading(true);
      getUserPublicIdCached().then((pid) => {
        if (!mounted) return;
        setPublicId(pid);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return { publicId, loading };
}
