"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageFinance } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";

export interface DirectPaymentInput {
  memberId?: string; // set when the payer is an existing member
  paymentRequestId?: string; // set when recording against a specific request (dues, etc.)
  payerName: string;
  payerEmail?: string;
  amount: number;
  paymentMethod: string; // CASH, UPI, BANK_TRANSFER, CHEQUE, CARD, OTHER
  referenceNumber?: string;
  description: string;
  categoryId?: string;
  accountId?: string;
  date?: string; // ISO
}

/**
 * Finance-admin records money received directly (cash, UPI to treasurer, etc.)
 * from a member or an external contributor, then issues the official receipt.
 * External payers are recorded as (or matched to) a Contributor so their giving
 * accumulates over time.
 */
export async function recordDirectPayment(input: DirectPaymentInput) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

  const name = input.payerName?.trim();
  const amount = Number(input.amount);
  const description = input.description?.trim();

  if (!name) return { error: "Payer name is required." };
  if (!description) return { error: "A purpose/description is required." };
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };

  try {
    // Resolve club — prefer the admin's member club, else the default club.
    let clubId: string | undefined;
    if (session.member?.id) {
      const member = await prisma.member.findUnique({ where: { id: session.member.id } });
      clubId = member?.clubId;
    }
    if (!clubId) clubId = (await prisma.club.findFirst())?.id;
    if (!clubId) return { error: "No club found." };

    // Active financial year (create one if none exists yet).
    let fy = await prisma.financialYear.findFirst({ where: { clubId, status: "ACTIVE" } });
    if (!fy) {
      fy = await prisma.financialYear.create({
        data: {
          clubId,
          name: "RY 2026-27",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2027-06-30"),
          openingBalance: 0,
          status: "ACTIVE",
        },
      });
    }

    // Resolve the payer: either an existing member, or an external contributor
    // (matched/created so their giving accumulates over time).
    let memberId: string | null = null;
    let contributorId: string | null = null;

    if (input.memberId) {
      const m = await prisma.member.findUnique({ where: { id: input.memberId }, select: { id: true } });
      if (!m) return { error: "Selected member not found." };
      memberId = m.id;

      if (input.paymentRequestId) {
        const duplicate = await prisma.transaction.findFirst({
          where: {
            memberId: m.id,
            paymentRequestId: input.paymentRequestId,
            status: "APPROVED"
          }
        });
        if (duplicate) {
          return { error: "This member has already paid for this request." };
        }
      }
    } else {
      let contributor = await prisma.contributor.findFirst({ where: { clubId, name } });
      if (!contributor) {
        contributor = await prisma.contributor.create({
          data: { clubId, name, contact: input.payerEmail?.trim() || null, type: "DONOR", totalContributed: 0 },
        });
      } else if (input.payerEmail?.trim() && !contributor.contact) {
        contributor = await prisma.contributor.update({
          where: { id: contributor.id },
          data: { contact: input.payerEmail.trim() },
        });
      }
      contributorId = contributor.id;
    }

    const txn = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          clubId,
          title: description.slice(0, 120),
          description,
          amount,
          type: "INCOME",
          status: "APPROVED",
          date: input.date ? new Date(input.date) : new Date(),
          categoryId: input.categoryId || null,
          accountId: input.accountId || null,
          financialYearId: fy!.id,
          paymentMethod: input.paymentMethod || "CASH",
          referenceNumber: input.referenceNumber?.trim() || null,
          memberId,
          contributorId,
          paymentRequestId: input.paymentRequestId || null,
          createdBy: session.id,
          approvedBy: session.id,
          approvedAt: new Date(),
        },
      });

      // Credit the account, and the contributor's running total (external only).
      if (input.accountId) {
        await tx.account.update({
          where: { id: input.accountId },
          data: { currentBalance: { increment: amount } },
        });
      }
      if (contributorId) {
        await tx.contributor.update({
          where: { id: contributorId },
          data: { totalContributed: { increment: amount } },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "record_direct_payment",
          entity: "transaction",
          entityId: created.id,
          changes: JSON.stringify({ payer: name, amount, method: input.paymentMethod }),
        },
      });

      return created;
    });

    // Issue the official receipt (PDF → Drive) and email it if we have an address.
    let receiptNumber: string | undefined;
    let url: string | null = null;
    try {
      const r = await issueReceipt(txn.id, { email: true });
      receiptNumber = r.receiptNumber;
      url = r.url;
    } catch (err) {
      console.error("recordDirectPayment: receipt generation failed:", err);
    }

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    revalidatePath("/admin/finance/requests");
    return { success: true, transactionId: txn.id, receiptNumber, url, emailed: !!input.payerEmail?.trim() };
  } catch (e: any) {
    console.error("recordDirectPayment error:", e);
    return { error: e.message || "Failed to record payment" };
  }
}

/**
 * Record several direct payments in one go — e.g. a batch of members who
 * already paid by cash/UPI/etc. at an event and are being reconciled together.
 * Each row is processed independently (its own transaction + receipt) so one
 * bad row doesn't block the rest; failures are reported per payer.
 */
export async function recordBulkDirectPayments(inputs: DirectPaymentInput[]) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };
  if (!inputs.length) return { error: "No payers selected." };

  const results: Array<{ payerName: string; success: boolean; error?: string; receiptNumber?: string }> = [];
  for (const input of inputs) {
    const res = await recordDirectPayment(input);
    if ("error" in res) {
      results.push({ payerName: input.payerName, success: false, error: res.error });
    } else {
      results.push({ payerName: input.payerName, success: true, receiptNumber: res.receiptNumber });
    }
  }

  return {
    success: true,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}
