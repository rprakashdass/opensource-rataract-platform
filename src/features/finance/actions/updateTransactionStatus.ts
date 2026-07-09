"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateTransactionStatus(transactionId: string, newStatus: TransactionStatus) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // Permissions check: Treasurer or President only
    const hasAccess = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r)
    );
    if (!hasAccess) return { error: "Only the Treasurer or President can moderate transactions" };

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id: transactionId }
      });
      if (!existing) throw new Error("Transaction not found");

      if (existing.status === newStatus) return existing;

      // Handle Account balance updates
      if (existing.accountId) {
        const isCurrentlyCredited = existing.status === "APPROVED";
        const shouldBeCredited = newStatus === "APPROVED";

        if (!isCurrentlyCredited && shouldBeCredited) {
          // Add to account balance
          const adjustment = existing.type === "INCOME" ? existing.amount : -existing.amount;
          await tx.account.update({
            where: { id: existing.accountId },
            data: { currentBalance: { increment: adjustment } }
          });
        } else if (isCurrentlyCredited && !shouldBeCredited) {
          // Reverse account balance adjustment
          const adjustment = existing.type === "INCOME" ? -existing.amount : existing.amount;
          await tx.account.update({
            where: { id: existing.accountId },
            data: { currentBalance: { increment: adjustment } }
          });
        }
      }

      // Update status
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: newStatus,
          approvedBy: session.id,
          approvedAt: new Date()
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "update_transaction_status",
          entity: "transaction",
          entityId: transactionId,
          changes: JSON.stringify({
            oldStatus: existing.status,
            newStatus,
            amount: existing.amount,
            type: existing.type
          })
        }
      });

      return updated;
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    return { success: true, transaction: result };
  } catch (error: any) {
    console.error("Update transaction status error:", error);
    return { error: error.message || "Failed to update transaction status" };
  }
}
