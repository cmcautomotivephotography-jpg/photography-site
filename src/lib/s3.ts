import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = process.env.S3_BUCKET?.trim() || "photography-images";

/**
 * Returns an S3 client for the self-hosted MinIO instance, or null if the
 * environment isn't configured yet — mirroring the old lazy Supabase factory
 * so the app still builds and renders before keys are pasted in.
 */
export function getS3Client(): S3Client | null {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    endpoint,
    region: process.env.S3_REGION?.trim() || "us-east-1",
    credentials: { accessKeyId, secretAccessKey },
    // MinIO serves buckets at <endpoint>/<bucket>, not <bucket>.<endpoint>.
    forcePathStyle: true,
  });
}

/** Public URL of an object — the bucket has anonymous read enabled. */
export function publicObjectUrl(key: string): string {
  const endpoint = (process.env.S3_ENDPOINT?.trim() ?? "").replace(/\/+$/, "");
  return `${endpoint}/${S3_BUCKET}/${key}`;
}
