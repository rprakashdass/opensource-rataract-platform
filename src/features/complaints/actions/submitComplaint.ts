"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { sendEmail } from "@/lib/email";
import { getNotificationEmailHtml } from "@/lib/email-templates";

export type ComplaintCategory = "COMPLAINT" | "FEEDBACK" | "SUGGESTION" | "OTHER";

export async function submitComplaint(data: {
  category: ComplaintCategory;
  message: string;
  attachmentUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "You must be logged in to submit a complaint." };
    }

    const club = await getCurrentClub();
    if (!club) {
      return { error: "Club not found." };
    }

    const message = data.message.trim();
    if (message.length < 20) {
      return { error: "Message must be at least 20 characters." };
    }
    if (message.length > 1000) {
      return { error: "Message must be under 1000 characters." };
    }

    const validCategories: ComplaintCategory[] = ["COMPLAINT", "FEEDBACK", "SUGGESTION", "OTHER"];
    if (!validCategories.includes(data.category)) {
      return { error: "Invalid category." };
    }

    // Intentionally no user reference stored — anonymous by design
    const complaint = await prisma.anonComplaint.create({
      data: {
        clubId: club.id,
        category: data.category,
        message,
        attachmentUrl: data.attachmentUrl,
        status: "OPEN",
      },
    });

    const settings = await prisma.websiteSettings.findUnique({
      where: { clubId: club.id },
      select: { speakUpEmail: true },
    });

    if (settings?.speakUpEmail) {
      const subject = `[Speak Up] New ${data.category.toLowerCase()} submitted`;
      const htmlBody = `
        <p>A new anonymous ${data.category.toLowerCase()} was submitted via the Speak Up portal.</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #475569;">
          ${message}
        </blockquote>
        ${data.attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${data.attachmentUrl}">View Attachment</a></p>` : ''}
        <p>You can view and manage this complaint in the admin portal.</p>
      `;

      await sendEmail({
        to: settings.speakUpEmail,
        subject,
        html: getNotificationEmailHtml(subject, htmlBody, "Admin", club),
        text: `A new anonymous ${data.category.toLowerCase()} was submitted:\n\n${message}\n\n${data.attachmentUrl || ''}`,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[submitComplaint] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
