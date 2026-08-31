"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { externalMailComposeSchema, ExternalMailComposeFormData } from "../schemas/externalMail.schema";
import { revalidatePath } from "next/cache";

export async function createExternalMailRequest(data: ExternalMailComposeFormData) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (!member) return { error: "Member profile not found" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const parsed = externalMailComposeSchema.parse(data);

    const request = await prisma.externalMailRequest.create({
      data: {
        clubId: club.id,
        requestedById: member.id,
        recipients: parsed.recipients,
        deliveryMode: parsed.deliveryMode,
        subject: parsed.subject,
        body: parsed.body,
        status: "PENDING_APPROVAL",
      },
    });

    revalidatePath("/member/mail-requests");
    revalidatePath("/admin/mail-requests");

    return { success: true, request: { id: request.id } };
  } catch (error: any) {
    console.error("Create external mail request error:", error);
    return { error: error.message || "Failed to submit mail request" };
  }
}
