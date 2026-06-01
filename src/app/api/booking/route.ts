import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

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

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "The booking system isn't configured yet. Add your Supabase URL and anon key to .env.local.",
      },
      { status: 503 },
    );
  }

  // The heavy lifting (find-or-create client, then create the linked job with
  // status "Inquiry") happens atomically inside the `submit_inquiry` Postgres
  // function. See supabase-schema.sql. This keeps the clients table locked down
  // under RLS so the public anon key can't read other people's contact info.
  const { data, error } = await supabase.rpc("submit_inquiry", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_company: company,
    p_phone: phone,
    p_email: email,
    p_job_type: jobType,
    p_description: description,
    p_preferred_shoot_date: preferredDate,
    p_message: message,
  });

  if (error) {
    console.error("Supabase submit_inquiry error:", error);
    return NextResponse.json(
      { error: "We couldn't save your inquiry. Please try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, jobId: data });
}
