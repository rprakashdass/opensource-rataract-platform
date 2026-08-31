"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageCommunication } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { sendEmail } from "@/lib/email";
import { getNotificationEmailHtml } from "@/lib/email-templates";
import { sendToRecipients } from "../lib/sendToRecipients";
import { MailRecipient } from "../schemas/externalMail.schema";
import { revalidatePath } from "next/cache";

export async function reviewExternalMailRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  try {
    const session = await getSession();
    if (!session || !canManageCommunication(session)) return { error: "Unauthorized" };

    const request = await prisma.externalMailRequest.findUnique({
      where: { id },
      include: { requestedBy: { include: { user: true } } },
    });
    if (!request) return { error: "Mail request not found" };
    if (request.status !== "PENDING_APPROVAL") return { error: "This request has already been reviewed" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const recipients = request.recipients as unknown as MailRecipient[];

    if (status === "REJECTED") {
      await prisma.externalMailRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason?.trim() || null,
          reviewedById: session.id,
          reviewedAt: new Date(),
        },
      });

      const memberEmail = request.requestedBy?.user?.email;
      if (memberEmail) {
        const recipientList = recipients.map((r) => r.email).join(", ");
        await sendEmail({
          to: memberEmail,
          subject: `Your mail request to ${recipientList} was not approved`,
          html: getNotificationEmailHtml(
            "Mail request update",
            `Your draft email to <strong>${recipientList}</strong> ("${request.subject}") was not approved.` +
              (rejectionReason?.trim() ? `<br/><br/><em>Reason:</em> ${rejectionReason.trim()}` : ""),
            request.requestedBy?.name || "there",
            club
          ),
        });
      }

      revalidatePath("/admin/mail-requests");
      revalidatePath("/member/mail-requests");
      return { success: true };
    }

    // APPROVED: send immediately from the club's Gmail account, per the
    // delivery mode the member (or admin) chose when drafting it.
    const result = await sendToRecipients({
      recipients,
      deliveryMode: request.deliveryMode,
      subject: request.subject,
      body: request.body,
      club,
    });

    if (!result.success) {
      return { error: "Approved, but the email failed to send. Please try again." };
    }

    await prisma.externalMailRequest.update({
      where: { id },
      data: {
        status: "SENT",
        reviewedById: session.id,
        reviewedAt: new Date(),
        sentById: session.id,
        sentAt: new Date(),
      },
    });

    revalidatePath("/admin/mail-requests");
    revalidatePath("/member/mail-requests");

    return { success: true };
  } catch (error: any) {
    console.error("Review external mail request error:", error);
    return { error: error.message || "Failed to review mail request" };
  }
}
