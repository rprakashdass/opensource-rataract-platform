import type { Prisma, Transaction } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

/**
 * Undoes what an APPROVED transaction did to its Account balance and (if an
 * external contributor) their running total. Shared by un-approving/rejecting
 * a transaction and by deleting an approved one outright — previously these
 * had two separate copies, and the status-change path was missing the
 * contributor reversal that delete already had.
 */
export async function reverseTransactionEffects(tx: TxClient, existing: Transaction) {
  if (existing.status !== "APPROVED") return;

  if (existing.accountId) {
    const adjustment = existing.type === "INCOME" ? -existing.amount.toNumber() : existing.amount.toNumber();
    await tx.account.update({
      where: { id: existing.accountId },
      data: { currentBalance: { increment: adjustment } },
    });
  }
  if (existing.contributorId) {
    await tx.contributor.update({
      where: { id: existing.contributorId },
      data: { totalContributed: { decrement: existing.amount } },
    });
  }
}
