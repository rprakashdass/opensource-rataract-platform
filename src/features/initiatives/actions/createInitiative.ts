"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { initiativeSchema, InitiativeFormData } from "../schemas/initiative.schema";
import { revalidatePath } from "next/cache";

export async function createInitiative(data: InitiativeFormData, submit: boolean = false) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (!member) return { error: "Member profile not found" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const parsed = initiativeSchema.parse(data);

    const initiative = await prisma.initiative.create({
      data: {
        clubId: club.id,
        proposedById: member.id,
        title: parsed.title,
        description: parsed.description,
        portfolioId: parsed.portfolioId || null,
        problemStatement: parsed.problemStatement || null,
        expectedImpact: parsed.expectedImpact || null,
        estimatedBudget: parsed.estimatedBudget ?? null,
        preferredDate: parsed.preferredDate ? new Date(parsed.preferredDate) : null,
        attachments: parsed.attachments,
        status: submit ? "SUBMITTED" : "DRAFT",
        submittedAt: submit ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/initiatives");
    revalidatePath("/admin/proposals");

    return { success: true, initiative };
  } catch (error: any) {
    console.error("Create initiative error:", error);
    return { error: error.message || "Failed to create proposal" };
  }
}
