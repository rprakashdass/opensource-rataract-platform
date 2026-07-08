"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function createBudget(data: {
  amount: number;
  projectId?: string;
  eventId?: string;
  financialYearId: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const member = await prisma.member.findUnique({
        where: { id: session.member?.id || "" }
    });
    
    // Fallback for admins without member records
    let clubId = member?.clubId;
    if (!clubId) {
        const defaultClub = await getOrCreateDefaultClub();
        clubId = defaultClub?.id;
    }
    
    if (!clubId) return { error: "Club association not found" };

    if (!data.projectId && !data.eventId) {
        return { error: "Budget must be linked to either a Project or an Event" };
    }

    const budget = await prisma.budget.create({
      data: {
        clubId,
        allocatedAmount: data.amount,
        projectId: data.projectId || null,
        eventId: data.eventId || null,
        financialYearId: data.financialYearId,
      }
    });

    revalidatePath("/admin/finance/budgets");
    return { success: true, budget };
  } catch (error: any) {
    console.error("Create budget error:", error);
    if (error.code === 'P2002') {
        return { error: "A budget already exists for this Project/Event" };
    }
    return { error: error.message || "Failed to create budget" };
  }
}

export async function deleteBudget(id: string) {
    try {
        const session = await getSession();
        if (!session) return { error: "Unauthorized" };
    
        await prisma.budget.delete({
            where: { id }
        });
    
        revalidatePath("/admin/finance/budgets");
        return { success: true };
      } catch (error: any) {
        console.error("Delete budget error:", error);
        return { error: error.message || "Failed to delete budget" };
      }
}
