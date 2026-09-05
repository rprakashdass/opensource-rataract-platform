"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";

export async function updateTransactionStatus(transactionId: string, newStatus: TransactionStatus) {
  try {
    const session = await getSession();
    if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

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

      // Self-submitted payments never have an account picked (members just
      // pay into the club's one official account) — default it in on
      // approval instead of silently crediting nothing.
      let accountId = existing.accountId;
      if (!accountId && newStatus === "APPROVED") {
        const defaultAccount = await tx.account.findFirst({
          where: { clubId: existing.clubId, isDefault: true },
        });
        if (defaultAccount) accountId = defaultAccount.id;
      }

      // Handle Account balance updates
      if (accountId) {
        const isCurrentlyCredited = existing.status === "APPROVED";
        const shouldBeCredited = newStatus === "APPROVED";

        if (!isCurrentlyCredited && shouldBeCredited) {
          // Add to account balance
          const adjustment = existing.type === "INCOME" ? existing.amount : -existing.amount;
          await tx.account.update({
            where: { id: accountId },
            data: { currentBalance: { increment: adjustment } }
          });
        } else if (isCurrentlyCredited && !shouldBeCredited) {
          // Reverse account balance adjustment
          const adjustment = existing.type === "INCOME" ? -existing.amount : existing.amount;
          await tx.account.update({
            where: { id: accountId },
            data: { currentBalance: { increment: adjustment } }
          });
        }
      }

      // Update status
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: newStatus,
          accountId,
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

    // On approval, issue the official receipt (PDF → Drive) and email it.
    // Runs AFTER the DB transaction (PDF render + Drive upload are slow/networked)
    // and never blocks the status change if it fails.
    if (newStatus === "APPROVED" && result?.status === "APPROVED") {
      try {
        await issueReceipt(transactionId, { email: true });
      } catch (err) {
        console.error("Failed to issue receipt on approval:", err);
      }
    }

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    return { success: true, transaction: result };
  } catch (error: any) {
    console.error("Update transaction status error:", error);
    return { error: error.message || "Failed to update transaction status" };
  }
}
