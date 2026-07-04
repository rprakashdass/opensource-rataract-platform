import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends an email using Resend.
 * Defaults to sending from "Rotaract Platform <onboarding@resend.dev>" if a custom domain isn't verified.
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY is not set. Email not sent:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    return { success: true, dummy: true };
  }

  try {
    const data = await resend.emails.send({
      from: from || "Rotaract Platform <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
