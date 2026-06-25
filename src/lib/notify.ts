import { Resend } from "resend";

/** Studio inbox that should receive new-inquiry notifications. */
const NOTIFY_TO = "cmcautomotivephotography@gmail.com";

/**
 * Default sender. `onboarding@resend.dev` is Resend's shared test sender — it
 * works immediately without verifying a domain, so it's the safe fallback for
 * now. Once notifications@cmcphotographyslc.com is verified in Resend, set the
 * RESEND_FROM env var to:
 *   "CMC Photography <notifications@cmcphotographyslc.com>"
 * and no code change is needed.
 */
const DEFAULT_FROM = "CMC Photography <onboarding@resend.dev>";

export interface InquiryNotification {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  jobType: string;
  description: string | null;
  preferredDate: string | null;
  message: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Email the studio about a new booking inquiry.
 *
 * - No-ops (with a warning) when RESEND_API_KEY isn't configured, so local and
 *   preview environments keep working.
 * - Throws on a genuine send failure. The caller is responsible for catching
 *   that so a mail problem never blocks the inquiry from being saved.
 */
export async function sendInquiryNotification(
  inquiry: InquiryNotification,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY not set — skipping the inquiry email notification.",
    );
    return;
  }

  const from = process.env.RESEND_FROM?.trim() || DEFAULT_FROM;
  const fullName = `${inquiry.firstName} ${inquiry.lastName}`;
  const subject = `New Inquiry: ${fullName} - ${inquiry.jobType}`;

  // Order mirrors the booking form so the studio can scan it quickly.
  const fields: [label: string, value: string | null][] = [
    ["Name", fullName],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Company", inquiry.company],
    ["Job Type", inquiry.jobType],
    ["Description", inquiry.description],
    ["Preferred Shoot Date", inquiry.preferredDate],
    ["Message", inquiry.message],
  ];

  const text = fields
    .map(([label, value]) => `${label}: ${value ?? "—"}`)
    .join("\n");

  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#111;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee;">${escapeHtml(
            label,
          )}</td>
          <td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${
            value ? escapeHtml(value).replace(/\n/g, "<br>") : "—"
          }</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#FF3B4E;margin:0 0 4px;">New Booking Inquiry</h2>
      <p style="color:#555;margin:0 0 16px;">${escapeHtml(fullName)} — ${escapeHtml(
        inquiry.jobType,
      )}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
        ${rows}
      </table>
    </div>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: NOTIFY_TO,
    // Replies go straight to the prospect instead of the no-reply sender.
    replyTo: inquiry.email,
    subject,
    text,
    html,
  });

  if (error) {
    // Resend reports failures in the response body rather than throwing.
    throw new Error(`Resend error: ${error.name} — ${error.message}`);
  }
}
