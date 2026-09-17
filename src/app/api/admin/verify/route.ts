import { NextResponse } from "next/server";

/**
 * Verifies the admin password for the upload page's login gate. The password
 * lives only in the server-side ADMIN_PASSWORD env var — the client never
 * ships it and can only ask "is this right?".
 */
export async function POST(request: Request): Promise<NextResponse> {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin access isn't configured. Set ADMIN_PASSWORD." },
      { status: 503 },
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
