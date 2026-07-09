"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function voidTransaction(id: string, reason: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const isTreasurerOrAdmin = session.roles?.some((r: string) => 
      ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r)
    );

    if (!isTreasurerOrAdmin) {
        return { error: "Permission denied. Only admins and treasurers can void transactions." };
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true }
    });

    if (!transaction) return { error: "Transaction not found" };

    if (transaction.status !== "APPROVED") {
        return { error: "Only approved transactions can be voided." };
    }

    // Determine the reversing type
    const reversingType = transaction.type === "INCOME" ? "EXPENSE" : "INCOME";

    const result = await prisma.$transaction(async (tx) => {
        // 1. Mark original as VOIDED
        const updatedOriginal = await tx.transaction.update({
            where: { id },
            data: { status: "VOIDED" }
        });

        // 2. Create Reversing Transaction (immutable ledger principle)
        const reversingTx = await tx.transaction.create({
            data: {
                clubId: transaction.clubId,
                title: `[VOID] Reversal of ${transaction.title}`,
                description: `Void Reason: ${reason} (Reverses TX ID: ${transaction.id})`,
                amount: transaction.amount,
                type: reversingType,
                status: "APPROVED" as any, // Bypass TS warning if Prisma generated types are stale
                date: new Date(),
                categoryId: transaction.categoryId,
                projectId: transaction.projectId,
                eventId: transaction.eventId,
                accountId: transaction.accountId,
                financialYearId: transaction.financialYearId,
                paymentMethod: transaction.paymentMethod,
                referenceNumber: transaction.referenceNumber,
                receiptUrl: transaction.receiptUrl,
                createdBy: session.id,
                userId: session.id,
                memberId: session.member?.id || null,
            }
        });

        // 3. Reverse Account Balance
        if (transaction.accountId) {
            // Reversing type applied
            const adjustment = reversingType === "INCOME" ? transaction.amount : new Prisma.Decimal(-Number(transaction.amount));
            await tx.account.update({
                where: { id: transaction.accountId },
                data: {
                    currentBalance: { increment: adjustment }
                }
            });
        }

        // 4. Create Audit Log
        await tx.auditLog.create({
            data: {
                userId: session.id,
                action: "void_transaction",
                entity: "transaction",
                entityId: transaction.id,
                changes: JSON.stringify({
                    status: "VOIDED",
                    reason: reason,
                    reversingTransactionId: reversingTx.id
                })
            }
        });

        return updatedOriginal;
    });

    revalidatePath("/admin/finance");
    revalidatePath(`/admin/finance/transactions/${id}`);
    revalidatePath("/admin/finance/transactions");
    
    return { success: true, transaction: { ...result, amount: Number(result.amount) } };
  } catch (error: any) {
    console.error("Void transaction error:", error);
    return { error: error.message || "Failed to void transaction" };
  }
}
