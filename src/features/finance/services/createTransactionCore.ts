import { prisma } from "@/lib/prisma";
import { getOrCreateActiveFinancialYear } from "@/lib/finance/financialYear";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";

export type TransactionPayer =
  | { mode: "member"; memberId: string }
  | { mode: "contributor"; name: string; contact?: string | null }
  | { mode: "self"; userId: string; memberId?: string | null };

export interface CreateTransactionCoreInput {
  clubId: string;
  title?: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  payer: TransactionPayer;
  createdBy: string;
  autoApprove: boolean;
  status?: "DRAFT" | "PENDING_APPROVAL" | "APPROVED";
  categoryId?: string | null;
  categoryType?: "INCOME" | "EXPENSE";
  accountId?: string | null;
  projectId?: string | null;
  eventId?: string | null;
  paymentRequestId?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  receiptUrl?: string | null;
  date?: string | Date | null;
  issueReceiptNow?: boolean;
  emailReceipt?: boolean;
}

/**
 * The one place a Transaction gets created, regardless of which UI triggered
 * it (admin generic entry, admin direct/bulk payment, member self-submit).
 * Every prior duplicate of this logic populated a different subset of
 * fields — most notably `memberId`/`userId` together, which is what made
 * payments invisible on a member's own history page. Single write path means
 * that bug class can't recur.
 */
export async function createTransactionCore(input: CreateTransactionCoreInput) {
  const amount = Number(input.amount);
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };
  const description = input.description?.trim();
  if (!description) return { error: "A description is required." };

  const fy = await getOrCreateActiveFinancialYear(input.clubId);

  // Resolve payer identity — memberId + userId are always set together for
  // a member/self payer, never just one.
  let memberId: string | null = null;
  let userId: string | null = null;
  let contributorId: string | null = null;
  let payerName = description;

  if (input.payer.mode === "member") {
    const member = await prisma.member.findUnique({
      where: { id: input.payer.memberId },
      select: { id: true, userId: true, name: true },
    });
    if (!member) return { error: "Selected member not found." };
    memberId = member.id;
    userId = member.userId;
    payerName = member.name || payerName;
  } else if (input.payer.mode === "self") {
    userId = input.payer.userId;
    memberId = input.payer.memberId ?? null;
  } else {
    const name = input.payer.name.trim();
    if (!name) return { error: "Payer name is required." };
    let contributor = await prisma.contributor.findFirst({ where: { clubId: input.clubId, name } });
    if (!contributor) {
      contributor = await prisma.contributor.create({
        data: { clubId: input.clubId, name, contact: input.payer.contact || null, type: "DONOR", totalContributed: 0 },
      });
    } else if (input.payer.contact && !contributor.contact) {
      contributor = await prisma.contributor.update({ where: { id: contributor.id }, data: { contact: input.payer.contact } });
    }
    contributorId = contributor.id;
    payerName = name;
  }

  // Duplicate-payment guard for a member paying against the same request twice.
  if (memberId && input.paymentRequestId) {
    const duplicate = await prisma.transaction.findFirst({
      where: { memberId, paymentRequestId: input.paymentRequestId, status: "APPROVED" },
    });
    if (duplicate) return { error: "This member has already paid for this request." };
  }

  // Category: `categoryId` here doubles as a stable slug ("DUES", "EVENT_FEE", ...)
  // in existing data — upsert-by-id preserves that (same id → same row, no
  // duplicates), it isn't a real cuid-based FK relationship in practice yet.
  if (input.categoryId) {
    await prisma.financeCategory.upsert({
      where: { id: input.categoryId },
      update: {},
      create: { id: input.categoryId, name: input.categoryId.replace(/_/g, " "), type: input.categoryType || input.type },
    });
  }

  const status = input.status || (input.autoApprove ? "APPROVED" : "PENDING_APPROVAL");

  const txn = await prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({
      data: {
        clubId: input.clubId,
        title: (input.title || description).slice(0, 120),
        description,
        amount,
        type: input.type,
        status,
        date: input.date ? new Date(input.date) : new Date(),
        categoryId: input.categoryId || null,
        accountId: input.accountId || null,
        projectId: input.projectId || null,
        eventId: input.eventId || null,
        financialYearId: fy.id,
        paymentMethod: input.paymentMethod || "CASH",
        referenceNumber: input.referenceNumber?.trim() || null,
        receiptUrl: input.receiptUrl || null,
        memberId,
        userId,
        contributorId,
        paymentRequestId: input.paymentRequestId || null,
        createdBy: input.createdBy,
        approvedBy: status === "APPROVED" ? input.createdBy : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    if (status === "APPROVED" && input.accountId) {
      const adjustment = input.type === "INCOME" ? amount : -amount;
      await tx.account.update({ where: { id: input.accountId }, data: { currentBalance: { increment: adjustment } } });
    }
    if (status === "APPROVED" && contributorId) {
      await tx.contributor.update({ where: { id: contributorId }, data: { totalContributed: { increment: amount } } });
    }

    await tx.auditLog.create({
      data: {
        userId: input.createdBy,
        action: "create_transaction",
        entity: "transaction",
        entityId: created.id,
        changes: JSON.stringify({ payer: payerName, amount, type: input.type, status }),
      },
    });

    return created;
  });

  let receiptNumber: string | undefined;
  let receiptUrl: string | null = null;
  if (status === "APPROVED" && input.issueReceiptNow !== false) {
    try {
      const r = await issueReceipt(txn.id, { email: input.emailReceipt !== false });
      receiptNumber = r.receiptNumber;
      receiptUrl = r.url;
    } catch (err) {
      console.error("createTransactionCore: receipt generation failed:", err);
    }
  }

  return { success: true as const, transaction: txn, receiptNumber, receiptUrl };
}
