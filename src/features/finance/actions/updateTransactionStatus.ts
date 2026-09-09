"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";
import { reverseTransactionEffects } from "@/features/finance/services/reverseTransactionEffects";
import { sendEmail } from "@/lib/email";

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
  opts?: { emailReceipt?: boolean }
) {
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
          // Reverse account balance AND contributor total — same formula
          // `DELETE` uses, so un-approving and deleting can't drift apart.
          await reverseTransactionEffects(tx, existing);
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
        await issueReceipt(transactionId, { email: opts?.emailReceipt !== false });
      } catch (err) {
        console.error("Failed to issue receipt on approval:", err);
      }
    }

    // On rejection, tell the payer — otherwise a submission just vanishes
    // from their view with no explanation of what happened to it.
    if (newStatus === "REJECTED" && result?.status === "REJECTED") {
      after(async () => {
        try {
          const payer = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
              amount: true,
              description: true,
              title: true,
              member: { select: { name: true, email: true } },
              user: { select: { name: true, email: true } },
              contributor: { select: { name: true, contact: true } },
            },
          });
          if (!payer) return;

          const email = payer.member?.email || payer.user?.email
            || (payer.contributor?.contact?.includes("@") ? payer.contributor.contact : null);
          if (!email) return;

          const name = payer.member?.name || payer.user?.name || payer.contributor?.name || "there";
          const amountStr = `₹${Number(payer.amount).toLocaleString("en-IN")}`;

          await sendEmail({
            to: email,
            subject: `Payment not approved — ${payer.title}`,
            category: "official",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <p>Hi ${name},</p>
                <p>Your submitted payment of <strong>${amountStr}</strong> for <strong>${payer.description || payer.title}</strong> was not approved by the finance team.</p>
                <p>If you believe this is a mistake, reply to this email or reach out to the treasurer directly.</p>
              </div>
            `,
            text: `Hi ${name}, your submitted payment of ${amountStr} for ${payer.description || payer.title} was not approved. Reply to this email if you believe this is a mistake.`,
          });
        } catch (err) {
          console.error("[updateTransactionStatus] rejection notify failed:", err);
        }
      });
    }

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    // Server Action return values cross the server/client boundary via
    // React's RSC serialization, which — unlike JSON.stringify — doesn't
    // know how to handle a Prisma Decimal (result.amount). No caller reads
    // the transaction object, so return primitives only instead of the raw
    // Prisma row.
    return { success: true, id: result.id, status: result.status };
  } catch (error: any) {
    console.error("Update transaction status error:", error);
    return { error: error.message || "Failed to update transaction status" };
  }
}
