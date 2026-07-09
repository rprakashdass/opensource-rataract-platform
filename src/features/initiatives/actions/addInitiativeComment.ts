"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function addInitiativeComment(initiativeId: string, body: string) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Unauthorized" };
    if (!body?.trim()) return { error: "Comment cannot be empty" };

    const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId } });
    if (!initiative) return { error: "Proposal not found" };

    const isAdmin = session.roles?.includes("SUPER_ADMIN") || session.roles?.includes("CLUB_ADMIN");
    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    const isProposer = member?.id === initiative.proposedById;

    if (!isAdmin && !isProposer) return { error: "Unauthorized" };

    const comment = await prisma.initiativeComment.create({
      data: {
        initiativeId,
        authorId: session.id,
        body: body.trim(),
        action: "COMMENT",
      },
    });

    revalidatePath(`/dashboard/initiatives/${initiativeId}`);
    revalidatePath(`/admin/proposals/${initiativeId}`);

    return { success: true, comment };
  } catch (error: any) {
    console.error("Add initiative comment error:", error);
    return { error: error.message || "Failed to add comment" };
  }
}
