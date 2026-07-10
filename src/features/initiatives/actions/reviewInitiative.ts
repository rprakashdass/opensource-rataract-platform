"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

const ACTION_LABELS: Record<string, string> = {
  UNDER_REVIEW: "Moved to under review",
  NEEDS_CHANGES: "Requested changes",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export async function reviewInitiative(
  id: string,
  status: "UNDER_REVIEW" | "NEEDS_CHANGES" | "APPROVED" | "REJECTED",
  comment?: string
) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const existing = await prisma.initiative.findUnique({ where: { id } });
    if (!existing) return { error: "Proposal not found" };
    if (existing.status === "CONVERTED") return { error: "This proposal has already been converted" };

    const initiative = await prisma.initiative.update({
      where: { id },
      data: {
        status,
        reviewedById: session.id,
        reviewedAt: new Date(),
      },
    });

    const body = comment?.trim() || ACTION_LABELS[status];
    await prisma.initiativeComment.create({
      data: {
        initiativeId: id,
        authorId: session.id,
        body,
        action: status,
      },
    });

    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/admin/proposals");
    revalidatePath(`/dashboard/initiatives/${id}`);
    revalidatePath("/dashboard/initiatives");

    return { success: true, initiative };
  } catch (error: any) {
    console.error("Review initiative error:", error);
    return { error: error.message || "Failed to update proposal" };
  }
}
