"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { transferSchema } from "../schemas/transaction.schema";
import { revalidatePath } from "next/cache";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function createTransfer(data: any) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Permissions check: Treasurer or President only
    const hasAccess = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r)
    );
    if (!hasAccess) return { error: "Only the Treasurer or President can execute transfers" };

    const parsed = transferSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { fromAccountId, toAccountId, amount, date } = parsed.data;
    if (fromAccountId === toAccountId) {
      return { error: "Cannot transfer to the same account" };
    }

    // Resolve clubId
    const member = await prisma.member.findUnique({
      where: { id: session.member?.id || "" }
    });
    let clubId = member?.clubId;
    if (!clubId) {
        const defaultClub = await getOrCreateDefaultClub();
        clubId = defaultClub?.id;
    }

    // Resolve active Financial Year
    const fy = await prisma.financialYear.findFirst({
      where: { clubId, status: "ACTIVE" }
    });

    const result = await prisma.$transaction(async (tx) => {
      // Fetch accounts to verify balances
      const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
      if (!fromAcc) throw new Error("Source account not found");
      if (Number(fromAcc.currentBalance) < amount) {
        throw new Error(`Insufficient funds in ${fromAcc.name}. Current: ₹${fromAcc.currentBalance}`);
      }

      // Deduct from Source
      await tx.account.update({
        where: { id: fromAccountId },
        data: { currentBalance: { decrement: amount } }
      });

      // Credit to Destination
      await tx.account.update({
        where: { id: toAccountId },
        data: { currentBalance: { increment: amount } }
      });

      // Create Transfer Log
      const transfer = await tx.transfer.create({
        data: {
          clubId,
          fromAccountId,
          toAccountId,
          amount,
          date: date ? new Date(date) : new Date(),
          financialYearId: fy?.id || null,
          createdBy: session.id
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "transfer_funds",
          entity: "transfer",
          entityId: transfer.id,
          changes: JSON.stringify({
            fromAccountId,
            toAccountId,
            amount
          })
        }
      });

      return transfer;
    });

    revalidatePath("/admin/finance");
    return { success: true, transfer: result };
  } catch (error: any) {
    console.error("Transfer funds error:", error);
    return { error: error.message || "Failed to transfer funds" };
  }
}
