import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
  // "transactional" (default): OTP, event invites, payment requests — sent
  // from a generic noreply address, no reply expected.
  // "official": invoices/receipts, meeting notices — sent from the club's
  // official-looking address with Reply-To set to the real club inbox, so
  // members who hit reply land somewhere a human actually reads.
  category?: "transactional" | "official";
}

/**
 * Sends email via Resend. Domain-verified sending only — no IP allowlisting,
 * no account-activation review, unlike the Brevo/Gmail SMTP setup this replaced.
 */
export async function sendEmail({ to, subject, html, text, from, cc, bcc, attachments, category = "transactional" }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipientCount = Array.isArray(to) ? to.length : 1;
  const logSend = (status: "SUCCESS" | "FAILED" | "SKIPPED", provider: string | null, error?: string) =>
    prisma.emailLog.create({ data: { subject, recipientCount, provider, status, error } }).catch((e) =>
      console.error("[sendEmail] failed to write EmailLog:", e)
    );

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is not set. Email not sent:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    await logSend("SKIPPED", null, "No email provider configured");
    return { success: true, dummy: true };
  }

  const club = await prisma.club.findFirst();
  const clubName = club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";

  const transactionalFrom = process.env.EMAIL_FROM_TRANSACTIONAL || "noreply@raccbenexus.org";
  const officialFrom = process.env.EMAIL_FROM_OFFICIAL || transactionalFrom;
  const officialReplyTo = process.env.EMAIL_REPLY_TO_OFFICIAL;

  const defaultFrom = `${clubName} <${category === "official" ? officialFrom : transactionalFrom}>`;
  const replyTo = category === "official" ? officialReplyTo : undefined;

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: from || defaultFrom,
      to,
      cc,
      bcc,
      replyTo,
      subject,
      text,
      html,
      attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
    });

    if (error) throw error;

    console.log(`Email sent via Resend: ${data?.id} to ${Array.isArray(to) ? to.join(", ") : to}`);
    await logSend("SUCCESS", "resend");
    return { success: true, messageId: data?.id, provider: "resend" };
  } catch (error: any) {
    console.error("❌ Resend send failed:", error);
    await logSend("FAILED", null, error?.message || String(error));
    return { success: false, error };
  }
}
