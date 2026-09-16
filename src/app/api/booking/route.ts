import { NextResponse } from "next/server";
import { sendInquiryNotification } from "@/lib/notify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const company = clean(body.company);
  const phone = clean(body.phone);
  const email = clean(body.email);
  const jobType = clean(body.jobType);
  const description = clean(body.description);
  const preferredDate = clean(body.preferredDate);
  const message = clean(body.message);

  // --- Server-side validation (never trust the client) ----------------------
  if (!firstName || !lastName || !phone || !email || !jobType) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 },
    );
  }
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (jobType !== "Real Estate" && jobType !== "Commercial") {
    return NextResponse.json({ error: "Invalid job type." }, { status: 400 });
  }

  // PostgREST endpoint on the home server, reached through the Cloudflare
  // Tunnel. Server-only env var — the browser never talks to it directly.
  const postgrestUrl = process.env.POSTGREST_URL?.trim()?.replace(/\/+$/, "");
  if (!postgrestUrl) {
    return NextResponse.json(
      { error: "The booking system isn't configured yet. Set POSTGREST_URL." },
      { status: 503 },
    );
  }

  // The heavy lifting (find-or-create client, then create the linked job with
  // status "Inquiry") happens atomically inside the `submit_inquiry` Postgres
  // function — see schema.sql. PostgREST exposes it at /rpc/submit_inquiry and
  // runs it as the EXECUTE-only cmc_app role, so the clients table stays
  // unreadable from the outside.
  let jobId: unknown;
  try {
    const res = await fetch(`${postgrestUrl}/rpc/submit_inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email,
        p_phone: phone,
        p_company: company,
        p_job_type: jobType,
        p_description: description,
        p_preferred_shoot_date: preferredDate,
        p_message: message,
      }),
    });

    if (!res.ok) {
      // PostgREST returns { code, message, details, hint } for Postgres errors.
      // When the function works via psql but fails here, the usual causes are:
      //   1. cmc_app lacks EXECUTE on submit_inquiry — re-run the GRANT.
      //   2. PostgREST's schema cache is stale — NOTIFY pgrst, 'reload schema';
      let pgError: {
        message?: string;
        code?: string;
        details?: string;
        hint?: string;
      } = {};
      try {
        pgError = await res.json();
      } catch {
        // Non-JSON body (e.g. a Cloudflare error page) — fall through.
      }
      console.error("PostgREST submit_inquiry error:", {
        status: res.status,
        ...pgError,
      });
      return NextResponse.json(
        { error: pgError.message ?? "Could not save your inquiry." },
        { status: 500 },
      );
    }

    // The function returns uuid; PostgREST serializes it as a JSON string.
    jobId = await res.json();
  } catch (err) {
    console.error("Could not reach PostgREST:", err);
    return NextResponse.json(
      { error: "Could not save your inquiry. Please try again shortly." },
      { status: 502 },
    );
  }

  // Notify the studio by email. The inquiry is already saved at this point, so
  // a mail failure must NOT fail the request — log it and still return success.
  try {
    await sendInquiryNotification({
      firstName,
      lastName,
      email,
      phone,
      company,
      jobType,
      description,
      preferredDate,
      message,
    });
  } catch (emailError) {
    console.error("Failed to send inquiry notification email:", emailError);
  }

  return NextResponse.json({ ok: true, jobId });
}
