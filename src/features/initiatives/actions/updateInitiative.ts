"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { initiativeSchema, InitiativeFormData } from "../schemas/initiative.schema";
import { revalidatePath } from "next/cache";

export async function updateInitiative(id: string, data: InitiativeFormData, submit: boolean = false) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (!member) return { error: "Member profile not found" };

    const existing = await prisma.initiative.findUnique({ where: { id } });
    if (!existing) return { error: "Proposal not found" };
    if (existing.proposedById !== member.id) return { error: "Unauthorized" };
    if (!["DRAFT", "NEEDS_CHANGES"].includes(existing.status)) {
      return { error: "This proposal can no longer be edited" };
    }

    const parsed = initiativeSchema.parse(data);

    const initiative = await prisma.initiative.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description,
        portfolioId: parsed.portfolioId || null,
        problemStatement: parsed.problemStatement || null,
        expectedImpact: parsed.expectedImpact || null,
        estimatedBudget: parsed.estimatedBudget ?? null,
        preferredDate: parsed.preferredDate ? new Date(parsed.preferredDate) : null,
        attachments: parsed.attachments,
        status: submit ? "SUBMITTED" : existing.status,
        submittedAt: submit ? new Date() : existing.submittedAt,
      },
    });

    revalidatePath("/dashboard/initiatives");
    revalidatePath(`/dashboard/initiatives/${id}`);
    revalidatePath("/admin/proposals");
    revalidatePath(`/admin/proposals/${id}`);

    return { success: true, initiative };
  } catch (error: any) {
    console.error("Update initiative error:", error);
    return { error: error.message || "Failed to update proposal" };
  }
}
