import "server-only";
import { escapeHtml } from "@/lib/utils/sanitize";

interface EnquiryEmail {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

/**
 * Sends a notification via Resend's HTTP API if RESEND_API_KEY is configured.
 * Failures are logged and never block the enquiry from being saved.
 */
export async function notifyNewEnquiry(data: EnquiryEmail, fallbackTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  const to = process.env.NOTIFY_TO_EMAIL || fallbackTo;
  if (!apiKey || !from || !to) return;

  const rows: [string, string | undefined][] = [
    ["Name", data.name],
    ["E-mail", data.email],
    ["Company", data.company],
    ["Service", data.service],
    ["Budget", data.budget],
    ["Timeline", data.timeline],
  ];
  const html = `
    <h2 style="font-family:sans-serif">New enquiry from your portfolio</h2>
    <table style="font-family:sans-serif;font-size:14px">
      ${rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v!)}</td></tr>`)
        .join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(data.message)}</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `New enquiry — ${data.name}${data.service ? ` (${data.service})` : ""}`,
        html,
      }),
    });
    if (!res.ok) console.error("[email] Resend responded", res.status);
  } catch (err) {
    console.error("[email]", err);
  }
}
