import { getUrl } from "aws-amplify/storage";

/**
 * Centralized S3 image URL resolver using Amplify getUrl().
 * Keep options consistent across the codebase.
 */
export const getImageUrl = async (s3Key: string): Promise<string | null> => {
  try {
    const publicUrl = await getUrl({
      path: s3Key,
      options: {
        validateObjectExistence: false,
        bucket: "commerce-central-images",
        useAccelerateEndpoint: true,
      },
    });
    return publicUrl.url.toString();
  } catch {
    return null;
  }
};

/**
 * Convenience helper: resolve the first image URL from a list of images.
 */
export const getPrimaryImageUrl = async (
  images: Array<{ s3_key: string }> | undefined | null
): Promise<string> => {
  if (!images || images.length === 0) {
    return "";
  }
  const url = await getImageUrl(images[0].s3_key);
  return url || "";
};
