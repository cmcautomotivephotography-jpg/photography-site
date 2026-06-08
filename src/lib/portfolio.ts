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
 * Dynamically fetch the portfolio from Vercel Blob storage. Returns an empty
 * list when the store isn't configured yet (no BLOB_READ_WRITE_TOKEN) so the
 * site still builds and renders. Server-only: the Blob SDK is imported lazily
 * so it never lands in a client bundle.
 */
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const { list } = await import("@vercel/blob");
  const { blobs } = await list();

  const items = blobs
    .map((blob) => {
      const filename = blob.pathname.split("/").pop() ?? blob.pathname;
      const category = categoryForFilename(filename);
      if (!category) return null;
      return {
        id: blob.pathname,
        title: titleFromFilename(filename, category),
        category,
        src: blob.url,
        uploadedAt: blob.uploadedAt,
      };
    })
    .filter((item): item is PortfolioItem & { uploadedAt: Date } => item !== null)
    // Newest uploads first.
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));

  return items.map(({ uploadedAt: _uploadedAt, ...item }) => item);
}

/**
 * URL of the most recently uploaded image in Blob storage, used as the home
 * hero background. Returns null when the store is empty or unconfigured (the
 * hero then falls back to its gradient). Resilient by design: any error
 * resolves to null so a Blob hiccup can never break the home page.
 */
export async function getLatestImageUrl(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list();

    const newest = blobs
      .filter((blob) => /\.(jpe?g|png|webp|avif|gif)$/i.test(blob.pathname))
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];

    return newest?.url ?? null;
  } catch (error) {
    console.error("Failed to load hero image from Blob:", error);
    return null;
  }
}
