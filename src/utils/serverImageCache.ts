import { getImageUrl } from "@/src/features/marketplace-catalog/services/imageService";

type CacheEntry = { url: string; ts: number };

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<string | null>>();

export async function resolveImageUrlCached(
  s3Key: string
): Promise<string | null> {
  const now = Date.now();
  const hit = cache.get(s3Key);
  if (hit && now - hit.ts < CACHE_TTL_MS) {
    return hit.url;
  }

  const inFlight = pending.get(s3Key);
  if (inFlight) {
    return inFlight;
  }

  const p = (async () => {
    try {
      const url = await getImageUrl(s3Key);
      cache.set(s3Key, { url: url ?? "", ts: Date.now() });
      return url;
    } finally {
      pending.delete(s3Key);
    }
  })();
  pending.set(s3Key, p);
  return p;
}
