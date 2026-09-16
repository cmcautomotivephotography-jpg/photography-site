export type PortfolioCategory = "real-estate" | "commercial";

export interface PortfolioItem {
  /** Stable id — we use the blob pathname, which is unique per object. */
  id: string;
  title: string;
  category: PortfolioCategory;
  /** Public URL of the image in Vercel Blob storage. */
  src: string;
}

export const categoryLabels: Record<PortfolioCategory, string> = {
  "real-estate": "Real Estate",
  commercial: "Commercial",
};

/**
 * Filename prefixes drive the category. The admin upload page prepends one of
 * these before sending the file to Blob storage, and we read it back here to
 * sort images into the right filter.
 */
export const categoryPrefixes: Record<PortfolioCategory, string> = {
  "real-estate": "real-estate-",
  commercial: "commercial-",
};

/** Map a stored filename back to a category via its prefix (null if neither). */
function categoryForFilename(filename: string): PortfolioCategory | null {
  if (filename.startsWith(categoryPrefixes["real-estate"])) return "real-estate";
  if (filename.startsWith(categoryPrefixes.commercial)) return "commercial";
  return null;
}

/**
 * Turn a stored filename like "real-estate-modern-kitchen-x7Kd9q2a.jpg" into a
 * readable caption ("Modern Kitchen"). Strips the category prefix, extension,
 * and the random suffix Blob adds to avoid name collisions.
 */
function titleFromFilename(filename: string, category: PortfolioCategory): string {
  const withoutPrefix = filename.slice(categoryPrefixes[category].length);
  const base = withoutPrefix
    .replace(/\.[^.]+$/, "") // drop extension
    .replace(/-[a-zA-Z0-9]{12,}$/, "") // drop random suffix from addRandomSuffix
    .replace(/[-_]+/g, " ")
    .trim();

  if (!base) return categoryLabels[category];
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Server-only: list every object in the MinIO portfolio bucket. The S3 SDK is
 * imported lazily so it never lands in a client bundle (this module is also
 * imported by the admin upload page for the category constants).
 */
async function listBucketObjects(): Promise<
  { key: string; url: string; uploadedAt: Date }[]
> {
  const { getS3Client, S3_BUCKET, publicObjectUrl } = await import("./s3");
  const client = getS3Client();
  if (!client) return [];

  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");

  const objects: { key: string; url: string; uploadedAt: Date }[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        ContinuationToken: continuationToken,
      }),
    );
    for (const obj of page.Contents ?? []) {
      if (!obj.Key) continue;
      objects.push({
        key: obj.Key,
        url: publicObjectUrl(obj.Key),
        uploadedAt: obj.LastModified ?? new Date(0),
      });
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
}

/**
 * Dynamically fetch the portfolio from MinIO. Returns an empty list when the
 * store isn't configured yet (no S3_* env vars) so the site still builds and
 * renders.
 */
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const objects = await listBucketObjects();

  return objects
    .map((obj) => {
      const filename = obj.key.split("/").pop() ?? obj.key;
      const category = categoryForFilename(filename);
      if (!category) return null;
      return {
        id: obj.key,
        title: titleFromFilename(filename, category),
        category,
        src: obj.url,
        uploadedAt: obj.uploadedAt,
      };
    })
    .filter((item): item is PortfolioItem & { uploadedAt: Date } => item !== null)
    // Newest uploads first.
    .sort((a, b) => +b.uploadedAt - +a.uploadedAt)
    .map(({ uploadedAt: _uploadedAt, ...item }) => item);
}

/**
 * URL of the most recently uploaded image, used as the home hero background.
 * Returns null when the store is empty or unconfigured (the hero then falls
 * back to its gradient). Resilient by design: any error resolves to null so a
 * storage hiccup can never break the home page.
 */
export async function getLatestImageUrl(): Promise<string | null> {
  try {
    const objects = await listBucketObjects();

    const newest = objects
      .filter((obj) => /\.(jpe?g|png|webp|avif|gif)$/i.test(obj.key))
      .sort((a, b) => +b.uploadedAt - +a.uploadedAt)[0];

    return newest?.url ?? null;
  } catch (error) {
    console.error("Failed to load hero image from MinIO:", error);
    return null;
  }
}
