"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
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
    if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

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

// Set (create or update) the single budget attached to an event. Resolves the
// active financial year automatically, matching createTransaction's pattern,
// so a budget can be set from the event page without a separate FY setup step.
export async function setEventBudget(eventId: string, amount: number) {
  try {
    const session = await getSession();
    // Finance admins can set any budget; an event's chair/co-chair can set
    // the budget for their own event.
    if (!session || !(canManageFinance(session) || (await canManageEvent(session, eventId)))) {
      return { error: "Unauthorized" };
    }

    if (!amount || amount <= 0) return { error: "Amount must be greater than 0" };

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { clubId: true } });
    if (!event) return { error: "Event not found" };

    let fy = await prisma.financialYear.findFirst({
      where: { clubId: event.clubId, status: "ACTIVE" }
    });
    if (!fy) {
      fy = await prisma.financialYear.create({
        data: {
          clubId: event.clubId,
          name: "RY 2026-27",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2027-06-30"),
          openingBalance: 0,
          status: "ACTIVE"
        }
      });
    }

    const budget = await prisma.budget.upsert({
      where: { eventId },
      update: { allocatedAmount: amount, financialYearId: fy.id },
      create: {
        clubId: event.clubId,
        eventId,
        allocatedAmount: amount,
        financialYearId: fy.id,
      }
    });

    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath("/admin/finance/budgets");
    return { success: true, budget: { ...budget, allocatedAmount: Number(budget.allocatedAmount) } };
  } catch (error: any) {
    console.error("Set event budget error:", error);
    return { error: error.message || "Failed to set budget" };
  }
}

export async function deleteBudget(id: string) {
    try {
        const session = await getSession();
        if (!session || !canManageFinance(session)) return { error: "Unauthorized" };
    
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
