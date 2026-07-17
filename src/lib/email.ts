import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
}

/**
 * Sends an email using Nodemailer and Gmail App Password.
 */
export async function sendEmail({ to, subject, html, text, from, attachments }: EmailOptions) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is not set. Email not sent:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    return { success: true, dummy: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  try {
    const club = await prisma.club.findFirst();
    const clubName = club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
    const defaultFrom = `"${clubName}" <${user}>`;
    const defaultReplyTo = club?.email || user;

    const info = await transporter.sendMail({
      from: from || defaultFrom,
      replyTo: defaultReplyTo,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
