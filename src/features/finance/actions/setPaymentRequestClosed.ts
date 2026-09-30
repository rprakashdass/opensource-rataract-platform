"use server";

import { prisma } from "@/lib/prisma";
import { getSession, hasRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Closes (or reopens) a payment request. Closing is the soft alternative to
 * deleting: the request and every transaction raised against it stay on the
 * books, but it stops asking members for money — it leaves their action list,
 * the pay page shows a closed notice instead of the form, and notify refuses
 * to send. Finance admins can still record late cash against a closed request,
 * since closing is about the ask, not about freezing the ledger.
 *
 * Same permission set as edit/delete (PUT/DELETE on the request), not the
 * narrower canManageFinance — closing is a lighter-weight delete.
 */
async function requireFinanceAdmin() {
  const session = await getSession();
  if (!hasRole(session, ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"])) return null;
  return session;
}

export async function setPaymentRequestClosed(requestId: string, closed: boolean) {
  const session = await requireFinanceAdmin();
  if (!session) return { error: "Unauthorized. Finance Admin required." };

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    select: { id: true, closedAt: true },
  });
  if (!request) return { error: "Request not found" };

  if (closed && request.closedAt) return { error: "This request is already closed." };
  if (!closed && !request.closedAt) return { error: "This request is already open." };

  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: closed
      ? { closedAt: new Date(), closedBy: session.id }
      : { closedAt: null, closedBy: null },
  });

  revalidatePath("/admin/finance/requests");
  revalidatePath(`/admin/finance/requests/${requestId}`);
  revalidatePath("/member/finance");
  revalidatePath(`/member/finance/requests/${requestId}`);

  return { success: true, closed };
}
