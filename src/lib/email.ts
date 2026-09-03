import nodemailer from "nodemailer";
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
}

/**
 * Sends an email using Brevo SMTP as primary, and Gmail App Password as fallback.
 */
export async function sendEmail({ to, subject, html, text, from, cc, bcc, attachments }: EmailOptions) {
  const brevoUser = process.env.BREVO_SMTP_USER;
  const brevoPass = process.env.BREVO_SMTP_PASSWORD;
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const recipientCount = Array.isArray(to) ? to.length : 1;
  const logSend = (status: "SUCCESS" | "FAILED" | "SKIPPED", provider: string | null, error?: string) =>
    prisma.emailLog.create({ data: { subject, recipientCount, provider, status, error } }).catch((e) =>
      console.error("[sendEmail] failed to write EmailLog:", e)
    );

  if ((!brevoUser || !brevoPass) && (!gmailUser || !gmailPass)) {
    console.warn("⚠️ Neither BREVO_SMTP_USER nor GMAIL_USER is set. Email not sent:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    await logSend("SKIPPED", null, "No email provider configured");
    return { success: true, dummy: true };
  }

  const club = await prisma.club.findFirst();
  const clubName = club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
  
  // Use Gmail user for 'from' address as fallback if not provided, assuming it's the verified sender
  const senderEmail = gmailUser || brevoUser || "noreply@nexus"; 
  const replyTo = club?.email || senderEmail;
  const defaultFrom = `"${clubName}" <${senderEmail}>`;

  const mailOptions = {
    from: from || defaultFrom,
    replyTo,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  };

  let lastError: any = null;

  // Try Brevo primary
  if (brevoUser && brevoPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user: brevoUser, pass: brevoPass },
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent via Brevo: ${info.messageId} to ${Array.isArray(to) ? to.join(", ") : to}`);
      await logSend("SUCCESS", "brevo");
      return { success: true, messageId: info.messageId, provider: "brevo" };
    } catch (error) {
      console.warn("⚠️ Brevo SMTP failed, falling back to Gmail:", error);
      lastError = error;
    }
  }

  // Fallback to Gmail
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent via Gmail: ${info.messageId} to ${Array.isArray(to) ? to.join(", ") : to}`);
      await logSend("SUCCESS", "gmail");
      return { success: true, messageId: info.messageId, provider: "gmail" };
    } catch (error) {
      console.error("❌ Gmail SMTP also failed:", error);
      lastError = error;
    }
  }

  await logSend("FAILED", null, lastError?.message || String(lastError));
  return { success: false, error: lastError };
}

