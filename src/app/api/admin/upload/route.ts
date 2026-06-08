import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/admin";

/**
 * Issues short-lived client upload tokens for the admin page. The browser never
 * sees the BLOB_READ_WRITE_TOKEN — it asks this route for a scoped token, then
 * uploads straight to Blob storage (so large photos bypass the serverless body
 * size limit).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Re-check the password server-side so the token can't be minted just
        // by hitting this endpoint directly.
        let password: unknown;
        try {
          password = JSON.parse(clientPayload ?? "{}").password;
        } catch {
          password = undefined;
        }
        if (password !== ADMIN_PASSWORD) {
          throw new Error("Invalid admin password.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Runs only when the deployment has a public URL (i.e. on Vercel, not
        // localhost). Nothing to persist — the portfolio reads straight from
        // Blob storage — so this is just a hook for logging.
        console.log("Blob upload completed:", blob.pathname);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
