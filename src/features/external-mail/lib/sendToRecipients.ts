import { sendEmail } from "@/lib/email";
import { getExternalMailHtml } from "@/lib/email-templates";
import { MailRecipient } from "../schemas/externalMail.schema";

/**
 * Sends one drafted email to a list of recipients using the chosen delivery mode:
 * - BCC: one send, everyone hidden from each other, generic "Dear Sir/Madam".
 * - CC: one send, everyone visible to each other, generic "Dear Sir/Madam".
 * - SEPARATE: one personalized send per recipient, greeted by their own name.
 */
export async function sendToRecipients({
  recipients,
  deliveryMode,
  subject,
  body,
  club,
}: {
  recipients: MailRecipient[];
  deliveryMode: "BCC" | "CC" | "SEPARATE";
  subject: string;
  body: string;
  club: any;
}): Promise<{ success: boolean; error?: any }> {
  const emails = recipients.map((r) => r.email);
  const clubFromAddress = club.email || process.env.GMAIL_USER;

  if (deliveryMode === "SEPARATE") {
    const results = await Promise.all(
      recipients.map((r) =>
        sendEmail({
          to: r.email,
          subject,
          html: getExternalMailHtml(r.name, body, club),
        })
      )
    );
    const failed = results.find((r) => !r.success);
    return failed ? { success: false, error: failed.error } : { success: true };
  }

  const greeting = "Sir/Madam";
  if (deliveryMode === "CC") {
    return sendEmail({
      to: emails[0],
      cc: emails.slice(1),
      subject,
      html: getExternalMailHtml(greeting, body, club),
    });
  }

  // BCC (default): `to` must still be a real address, so it's aimed at the club's own inbox.
  return sendEmail({
    to: emails.length > 1 ? clubFromAddress || emails[0] : emails[0],
    bcc: emails.length > 1 ? emails : undefined,
    subject,
    html: getExternalMailHtml(greeting, body, club),
  });
}
