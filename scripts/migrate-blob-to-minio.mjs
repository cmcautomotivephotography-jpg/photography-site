#!/usr/bin/env node
/**
 * One-off migration: copy every object from Vercel Blob into the MinIO bucket,
 * preserving pathnames exactly (categories and captions are derived from them).
 *
 * Idempotent: objects already present in MinIO with a matching size are
 * skipped, so it's safe to re-run after a partial failure.
 *
 * Run from the repo root with @vercel/blob still installed:
 *
 *   BLOB_READ_WRITE_TOKEN=... \
 *   S3_ENDPOINT=https://storage.cmcphotographyslc.com \
 *   S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... \
 *   node scripts/migrate-blob-to-minio.mjs
 */
import { list } from "@vercel/blob";
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.S3_BUCKET ?? "photography-images";

for (const name of [
  "BLOB_READ_WRITE_TOKEN",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
]) {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// Page through the whole Blob store.
const blobs = [];
let cursor;
do {
  const page = await list({ cursor, limit: 1000 });
  blobs.push(...page.blobs);
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

console.log(`Found ${blobs.length} blobs in Vercel Blob storage.`);

let copied = 0;
let skipped = 0;
let failed = 0;

for (const blob of blobs) {
  try {
    try {
      const head = await s3.send(
        new HeadObjectCommand({ Bucket: BUCKET, Key: blob.pathname }),
      );
      if (head.ContentLength === blob.size) {
        skipped++;
        continue;
      }
    } catch {
      // Not in MinIO yet — copy it below.
    }

    const res = await fetch(blob.url);
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
    const body = Buffer.from(await res.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: blob.pathname,
        Body: body,
        ContentType:
          res.headers.get("content-type") ?? "application/octet-stream",
      }),
    );
    copied++;
    console.log(`  copied  ${blob.pathname} (${(blob.size / 1024).toFixed(0)} KB)`);
  } catch (err) {
    failed++;
    console.error(`  FAILED  ${blob.pathname}: ${err.message}`);
  }
}

console.log(`\nDone: ${copied} copied, ${skipped} skipped, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
