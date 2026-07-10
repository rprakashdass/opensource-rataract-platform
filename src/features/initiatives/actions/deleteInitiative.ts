"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function deleteInitiative(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (!member) return { error: "Member profile not found" };

    const existing = await prisma.initiative.findUnique({ where: { id } });
    if (!existing) return { error: "Proposal not found" };
    if (existing.proposedById !== member.id) return { error: "Unauthorized" };
    if (existing.status !== "DRAFT") return { error: "Only draft proposals can be deleted" };

    await prisma.initiative.delete({ where: { id } });

    revalidatePath("/dashboard/initiatives");

    return { success: true };
  } catch (error: any) {
    console.error("Delete initiative error:", error);
    return { error: error.message || "Failed to delete proposal" };
  }
}
