"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { externalMailComposeSchema, ExternalMailComposeFormData } from "../schemas/externalMail.schema";
import { revalidatePath } from "next/cache";

export async function updateExternalMailRequest(id: string, data: ExternalMailComposeFormData) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (!member) return { error: "Member profile not found" };

    const existing = await prisma.externalMailRequest.findUnique({ where: { id } });
    if (!existing) return { error: "Mail request not found" };
    if (existing.requestedById !== member.id) return { error: "Unauthorized" };
    if (existing.status !== "PENDING_APPROVAL" && existing.status !== "REJECTED") {
      return { error: "This request can no longer be edited" };
    }

    const parsed = externalMailComposeSchema.parse(data);

    const request = await prisma.externalMailRequest.update({
      where: { id },
      data: {
        recipients: parsed.recipients,
        deliveryMode: parsed.deliveryMode,
        subject: parsed.subject,
        body: parsed.body,
        status: "PENDING_APPROVAL",
        rejectionReason: null,
        reviewedById: null,
        reviewedAt: null,
      },
    });

    revalidatePath("/member/mail-requests");
    revalidatePath(`/member/mail-requests/${id}`);
    revalidatePath("/admin/mail-requests");

    return { success: true, request: { id: request.id } };
  } catch (error: any) {
    console.error("Update external mail request error:", error);
    return { error: error.message || "Failed to update mail request" };
  }
}
