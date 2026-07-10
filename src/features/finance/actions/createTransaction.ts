"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { transactionSchema } from "../schemas/transaction.schema";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: any) {
  try {
    const session = await getSession();
    if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

    const parsed = transactionSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { 
      title, 
      description, 
      amount, 
      type, 
      categoryId, 
      accountId, 
      projectId, 
      eventId, 
      paymentMethod, 
      referenceNumber, 
      receiptUrl,
      date 
    } = parsed.data;

    // Resolve Club — prefer member's club, fall back to default club
    let clubId: string | undefined;
    if (session.member?.id) {
      const member = await prisma.member.findUnique({
        where: { id: session.member.id }
      });
      clubId = member?.clubId;
    }
    if (!clubId) {
      // Admin users may not have a member record — use the default club
      const defaultClub = await prisma.club.findFirst();
      clubId = defaultClub?.id;
    }
    if (!clubId) return { error: "No club found. Please set up the club first." };

    // Resolve or Auto-Create Active Financial Year
    let fy = await prisma.financialYear.findFirst({
      where: { clubId, status: "ACTIVE" }
    });
    if (!fy) {
      fy = await prisma.financialYear.create({
        data: {
          clubId,
          name: "RY 2026-27",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2027-06-30"),
          openingBalance: 0,
          status: "ACTIVE"
        }
      });
    }

    // Role-based Status Assignment
    const isTreasurerOrAdmin = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r)
    );
    const initialStatus = (parsed.data.status || (isTreasurerOrAdmin ? "APPROVED" : "PENDING_APPROVAL")) as string;

    const result = await prisma.$transaction(async (tx) => {
      // Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          clubId,
          title,
          description,
          amount,
          type,
          status: initialStatus as any,
          date: date ? new Date(date) : new Date(),
          categoryId,
          projectId: projectId || null,
          eventId: eventId || null,
          accountId,
          financialYearId: fy.id,
          paymentMethod: paymentMethod || "CASH",
          referenceNumber: referenceNumber || null,
          receiptUrl: receiptUrl || null,
          createdBy: session.id,
          userId: session.id,
          memberId: session.member?.id || null,
        }
      });

      // Update Account balance if approved
      if (initialStatus === "APPROVED") {
        const adjustment = type === "INCOME" ? amount : -amount;
        await tx.account.update({
          where: { id: accountId },
          data: {
            currentBalance: { increment: adjustment }
          }
        });
      }

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "create_transaction",
          entity: "transaction",
          entityId: transaction.id,
          changes: JSON.stringify({
            title,
            amount,
            type,
            status: initialStatus,
            accountId
          })
        }
      });

      return transaction;
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    return { success: true, transaction: { ...result, amount: Number(result.amount) } };
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return { error: error.message || "Failed to create transaction" };
  }
}
