"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageFinance } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";
import { createTransactionCore } from "@/features/finance/services/createTransactionCore";

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
export async function recordDirectPayment(input: DirectPaymentInput, opts?: { issueReceiptNow?: boolean }) {
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

    const result = await createTransactionCore({
      clubId,
      description,
      amount,
      type: "INCOME",
      autoApprove: true,
      payer: input.memberId
        ? { mode: "member", memberId: input.memberId }
        : { mode: "contributor", name, contact: input.payerEmail?.trim() || null },
      categoryId: input.categoryId || null,
      categoryType: "INCOME",
      accountId: input.accountId || null,
      paymentRequestId: input.paymentRequestId || null,
      paymentMethod: input.paymentMethod || "CASH",
      referenceNumber: input.referenceNumber?.trim() || null,
      date: input.date || null,
      createdBy: session.id,
      issueReceiptNow: opts?.issueReceiptNow,
      emailReceipt: true,
    });
    if ("error" in result) return { error: result.error };

    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/transactions");
    revalidatePath("/admin/finance/requests");
    return {
      success: true,
      transactionId: result.transaction.id,
      receiptNumber: result.receiptNumber,
      url: result.receiptUrl,
      emailed: opts?.issueReceiptNow !== false && !!input.payerEmail?.trim(),
    };
  } catch (e: any) {
    console.error("recordDirectPayment error:", e);
    return { error: e.message || "Failed to record payment" };
  }
}

/**
 * Record several direct payments in one go — e.g. a batch of members who
 * already paid by cash/UPI/etc. at an event and are being reconciled together.
 * Each row is processed independently (its own transaction) so one bad row
 * doesn't block the rest; failures are reported per payer.
 *
 * Receipts (PDF render + Drive upload + email) are deliberately NOT issued
 * inline here — for N payers that's N sequential renders/uploads/SMTP sends
 * in one request, which is slow enough to blow past the serverless timeout
 * and, along the way, hold DB connections open long enough to starve
 * unrelated requests. They're issued after this response is sent instead,
 * a few at a time.
 */
export async function recordBulkDirectPayments(inputs: DirectPaymentInput[]) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };
  if (!inputs.length) return { error: "No payers selected." };

  const results: Array<{ payerName: string; success: boolean; error?: string }> = [];
  const issuedTxnIds: string[] = [];
  for (const input of inputs) {
    const res = await recordDirectPayment(input, { issueReceiptNow: false });
    if ("error" in res) {
      results.push({ payerName: input.payerName, success: false, error: res.error });
    } else {
      results.push({ payerName: input.payerName, success: true });
      issuedTxnIds.push(res.transactionId);
    }
  }

  if (issuedTxnIds.length) {
    after(async () => {
      const CONCURRENCY = 3;
      for (let i = 0; i < issuedTxnIds.length; i += CONCURRENCY) {
        await Promise.all(
          issuedTxnIds.slice(i, i + CONCURRENCY).map((id) =>
            issueReceipt(id, { email: true }).catch((err) =>
              console.error(`[recordBulkDirectPayments] receipt failed for transaction ${id}:`, err)
            )
          )
        );
      }
    });
  }

  return {
    success: true,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}
