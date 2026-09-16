import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ADMIN_PASSWORD } from "@/lib/admin";
import { getS3Client, S3_BUCKET, publicObjectUrl } from "@/lib/s3";
import { categoryPrefixes, type PortfolioCategory } from "@/lib/portfolio";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

/** Make a safe, lowercase base name (no extension) from an original filename. */
function sanitizeBase(name: string): string {
  const withoutExt = name.toLowerCase().replace(/\.[^.]+$/, "");
  return (
    withoutExt.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "photo"
  );
}

/**
 * Issues short-lived presigned PUT URLs for the admin page. The browser never
 * sees the MinIO credentials — it asks this route for a signed URL, then
 * uploads straight to MinIO (so large photos bypass the serverless body size
 * limit, same design as the old Vercel Blob client-token flow).
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: {
    password?: unknown;
    category?: unknown;
    filename?: unknown;
    contentType?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Re-check the password server-side so a URL can't be minted just by
  // hitting this endpoint directly.
  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPG and PNG images are allowed." },
      { status: 400 },
    );
  }

  const category = body.category as PortfolioCategory;
  const prefix = categoryPrefixes[category];
  if (!prefix) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const client = getS3Client();
  if (!client) {
    return NextResponse.json(
      { error: "Storage isn't configured yet. Set the S3_* environment variables." },
      { status: 503 },
    );
  }

  // Random suffix to avoid name collisions (replaces Blob's addRandomSuffix).
  // Must stay >= 12 alphanumeric chars: titleFromFilename() strips it with
  // the /-[a-zA-Z0-9]{12,}$/ regex when building captions.
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const base = sanitizeBase(typeof body.filename === "string" ? body.filename : "photo");
  const key = `${prefix}${base}-${suffix}${ext}`;

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 600 },
  );

  return NextResponse.json({
    uploadUrl,
    publicUrl: publicObjectUrl(key),
    pathname: key,
  });
}
