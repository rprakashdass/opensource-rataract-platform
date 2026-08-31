"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageCommunication } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { sendToRecipients } from "../lib/sendToRecipients";
import { externalMailComposeSchema, ExternalMailComposeFormData } from "../schemas/externalMail.schema";
import { revalidatePath } from "next/cache";

export async function sendExternalMailDirect(data: ExternalMailComposeFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageCommunication(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const parsed = externalMailComposeSchema.parse(data);

    const result = await sendToRecipients({
      recipients: parsed.recipients,
      deliveryMode: parsed.deliveryMode,
      subject: parsed.subject,
      body: parsed.body,
      club,
    });

    if (!result.success) {
      return { error: "Failed to send email. Please try again." };
    }

    const request = await prisma.externalMailRequest.create({
      data: {
        clubId: club.id,
        recipients: parsed.recipients,
        deliveryMode: parsed.deliveryMode,
        subject: parsed.subject,
        body: parsed.body,
        status: "SENT",
        reviewedById: session.id,
        reviewedAt: new Date(),
        sentById: session.id,
        sentAt: new Date(),
      },
    });

    revalidatePath("/admin/mail-requests");

    return { success: true, request: { id: request.id } };
  } catch (error: any) {
    console.error("Send external mail direct error:", error);
    return { error: error.message || "Failed to send mail" };
  }
}
