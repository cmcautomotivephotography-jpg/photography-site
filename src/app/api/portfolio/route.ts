import { NextResponse } from "next/server";
import { getPortfolioItems } from "@/lib/portfolio";

// Always list fresh from Blob storage so newly uploaded photos show up without
// a redeploy.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getPortfolioItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to list portfolio blobs:", error);
    return NextResponse.json(
      { error: "Could not load the portfolio right now." },
      { status: 500 },
    );
  }
}
