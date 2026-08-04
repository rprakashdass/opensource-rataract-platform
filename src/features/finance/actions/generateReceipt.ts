"use server";

import { getSession, canManageFinance } from "@/lib/auth/session";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";
import { revalidatePath } from "next/cache";

/**
 * Manually (re)generate the official receipt for a transaction and email it to
 * the payer. Used for payments approved before receipts existed, or to reissue.
 */
export async function generateReceipt(transactionId: string, opts?: { force?: boolean }) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

  try {
    const r = await issueReceipt(transactionId, {
      approverName: (session as any)?.member?.name,
      email: true,
      force: opts?.force,
    });
    revalidatePath(`/admin/finance/transactions/${transactionId}`);
    return { success: true, url: r.url, receiptNumber: r.receiptNumber, emailed: !!r.payerEmail };
  } catch (e: any) {
    console.error("generateReceipt error:", e);
    return { error: e.message || "Failed to generate receipt" };
  }
}
